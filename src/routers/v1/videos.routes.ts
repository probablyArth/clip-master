import prismaClient from 'apps/database';
import getEnvVar from 'env/index';
import { ForbiddenError } from 'errors/forbidden-error';
import { InternalServerError } from 'errors/internal-server-error';
import { Router } from 'express';
import { validateRequestParams } from 'validators/validateRequest';
import { z } from 'zod';

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

export default VideosRouter;
