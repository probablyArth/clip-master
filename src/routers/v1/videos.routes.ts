import prismaClient from 'apps/database';
import getEnvVar from 'env/index';
import { ForbiddenError } from 'errors/forbidden-error';
import { InternalServerError } from 'errors/internal-server-error';
import { Router } from 'express';
import { validateRequestParams } from 'validators/validateRequest';
import { z } from 'zod';
import multer from 'multer';
import StorageConfig from 'config/storage.config';
import { NotFoundError } from 'errors/not-found-error';
import { mkdir } from 'fs/promises';

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

    res.sendFile(`${getEnvVar('STORAGE_PATH')}/${video.path}`);
  } catch (e) {
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
    limits: { fileSize: StorageConfig.fileSize, files: 1, fields: 0 },
    fileFilter(_, file, callback) {
      if (!file.mimetype.startsWith('video/')) {
        return callback(new Error('Invalid file type'));
      }
      callback(null, true);
    },
  }).single('video'),
  async (req, res, next) => {
    try {
      // eslint-disable-next-line no-undef
      const file = req.file as Express.Multer.File;
      if (!file) {
        return next(new NotFoundError());
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
    } catch (e) {
      next(new InternalServerError());
    }
  },
);

export default VideosRouter;
