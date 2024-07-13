import prismaClient from 'apps/database';
import getEnvVar from 'env/index';
import { ForbiddenError } from 'errors/forbidden-error';
import { InternalServerError } from 'errors/internal-server-error';
import { Router } from 'express';
import { validateRequestBody, validateRequestParams } from 'validators/validateRequest';
import { z } from 'zod';
import multer from 'multer';
import StorageConfig from 'config/storage.config';
import { mkdir, stat, unlink } from 'fs/promises';
import { BadRequestError } from 'errors/file-validation-error';
import ffmpeg from 'fluent-ffmpeg';
import { NotFoundError } from 'errors/not-found-error';
import { trimVideo } from 'utils/ffmpeg';

const VideosRouter = Router();

VideosRouter.get('/', async (req, res, next) => {
  try {
    const videos = await prismaClient.videos.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(videos, (_, v) => (typeof v === 'bigint' ? v.toString() : v)));
  } catch (e) {
    console.log(e);
    next(new InternalServerError());
  }
});

const GETdownloadParams = z.object({ videoId: z.string() });
type GETdownloadParamsT = z.infer<typeof GETdownloadParams>;
VideosRouter.get('/download/:videoId', validateRequestParams(GETdownloadParams), async (req, res, next) => {
  const params = req.params as GETdownloadParamsT;
  try {
    const video = await prismaClient.videos.findUnique({
      where: {
        id: params.videoId,
      },
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId !== req.user.id) {
      next(new ForbiddenError());
      return;
    }

    res.download(`${getEnvVar('STORAGE_PATH')}/${video.path}`);
  } catch (_) {
    next(new InternalServerError());
  }
});

const storage = multer.diskStorage({
  async destination(req, _, cb) {
    const userId = req.user.id;
    const fileLocation = StorageConfig.fileLocation(userId);
    await mkdir(fileLocation, { recursive: true });

    cb(null, fileLocation);
  },
  filename(_, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

VideosRouter.post(
  '/upload',
  multer({
    storage,
    limits: { fileSize: StorageConfig.maxFileSize, files: 1, fields: 0 },
    fileFilter(_, file, callback) {
      if (file.size > StorageConfig.maxFileSize) {
        return callback(new BadRequestError('File too large'));
      }
      if (!file.mimetype.startsWith('video/')) {
        return callback(new BadRequestError('Invalid file type'));
      }
      callback(null, true);
    },
  }).single('video'),
  async (req, res, next) => {
    try {
      // eslint-disable-next-line no-undef
      const file = req.file as Express.Multer.File;
      if (!file) {
        return next(new BadRequestError('File Not Found'));
      }

      const validateFile = () => {
        return new Promise((resolve: (data: { duration: number }) => void, reject) => {
          ffmpeg({ source: file.path }).ffprobe(async (err, data) => {
            if (err) {
              await unlink(file.path);
              return reject(new BadRequestError('Invalid file type'));
            }
            const duration = data.format.duration as number;
            if (duration > StorageConfig.maxVideoDuration) {
              await unlink(file.path);
              return reject(new BadRequestError('Video too long'));
            }
            if (duration < StorageConfig.minVideoDuration) {
              await unlink(file.path);
              return reject(new BadRequestError('Video too short'));
            }
            resolve({ duration });
          });
        });
      };
      let data: { duration: number };
      try {
        data = await validateFile();
      } catch (error) {
        return next(error);
      }

      const path = StorageConfig.relativeFileLocation(req.user.id, file.filename);

      await prismaClient.videos.create({
        data: {
          path,
          userId: req.user.id,
          name: file.filename,
          size: file.size,
          original_name: file.originalname,
          duration: data.duration,
        },
      });
      res.sendStatus(201);
    } catch (_) {
      next(new InternalServerError());
    }
  },
);

const POSTtrimParams = z.object({ start: z.union([z.number(), z.undefined()]), end: z.union([z.number(), z.undefined()]), videoId: z.string() });
type POSTtrimParamsT = z.infer<typeof POSTtrimParams>;
VideosRouter.post('/trim', validateRequestBody(POSTtrimParams), async (req, res, next) => {
  const { start, end, videoId } = req.body as POSTtrimParamsT;
  if (!start && !end) {
    return next(new BadRequestError('one of start or end is required'));
  }
  try {
    const video = await prismaClient.videos.findUnique({
      where: {
        id: videoId,
      },
    });
    if (!video) {
      return next(new NotFoundError());
    }
    if (video.userId !== req.user.id) {
      return next(new ForbiddenError());
    }
    let startTrim = 0;
    let endTrim = video.duration;
    if (start !== undefined) {
      if (start < 0) {
        return next(new BadRequestError('start must be greater than 0'));
      }
      startTrim = start;
    }
    if (end !== undefined) {
      if (end >= video.duration) {
        return next(new BadRequestError('end must be less than video duration'));
      }
      endTrim = end;
    }
    if (start !== undefined && end !== undefined) {
      if (start >= end) {
        return next(new BadRequestError('start must be less than end'));
      }
    }
    if (endTrim - startTrim < StorageConfig.minVideoDuration) {
      return next(new BadRequestError('Trimmed video too short'));
    }
    const inputPath = `${getEnvVar('STORAGE_PATH')}/${video.path}`;
    const newVideoName = Date.now() + '-' + video.original_name;
    const outputPath = StorageConfig.fileLocation(req.user.id) + newVideoName;
    await trimVideo({ inputPath, outputPath, start: startTrim, end: endTrim });
    const newVideoSize = (await stat(outputPath)).size;
    await prismaClient.videos.create({
      data: {
        duration: endTrim - startTrim,
        name: newVideoName,
        original_name: video.original_name,
        path: StorageConfig.relativeFileLocation(req.user.id, newVideoName),
        size: newVideoSize,
        userId: req.user.id,
      },
    });
    res.sendStatus(201);
  } catch (_) {
    next(new InternalServerError());
  }
});

export default VideosRouter;
