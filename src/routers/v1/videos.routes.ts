import prismaClient from 'apps/database';
import getEnvVar from 'env/index';
import { ForbiddenError } from 'errors/forbidden-error';
import { InternalServerError } from 'errors/internal-server-error';
import { Router } from 'express';
import { validateRequestParams } from 'validators/validateRequest';
import { z } from 'zod';
import multer from 'multer';
import StorageConfig from 'config/storage.config';
import { mkdir, unlink } from 'fs/promises';
import { FileValidationError } from 'errors/file-validation-error';
import ffmpeg from 'fluent-ffmpeg';

const VideosRouter = Router();

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
        return callback(new FileValidationError('File too large'));
      }
      if (!file.mimetype.startsWith('video/')) {
        return callback(new FileValidationError('Invalid file type'));
      }
      callback(null, true);
    },
  }).single('video'),
  async (req, res, next) => {
    try {
      // eslint-disable-next-line no-undef
      const file = req.file as Express.Multer.File;
      if (!file) {
        return next(new FileValidationError('File Not Found'));
      }

      const validateFile = () => {
        return new Promise((resolve, reject) => {
          ffmpeg({ source: file.path }).ffprobe(async (err, data) => {
            if (err) {
              await unlink(file.path);
              return reject(new FileValidationError('Invalid file type'));
            }
            const duration = data.format.duration as number;
            if (duration > StorageConfig.maxVideoDuration) {
              await unlink(file.path);
              return reject(new FileValidationError('Video too long'));
            }
            if (duration < StorageConfig.minVideoDuration) {
              await unlink(file.path);
              return reject(new FileValidationError('Video too short'));
            }
            resolve(true);
          });
        });
      };

      try {
        await validateFile();
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
        },
      });
      res.sendStatus(201);
    } catch (_) {
      next(new InternalServerError());
    }
  },
);

VideosRouter.post('/trim');

export default VideosRouter;
