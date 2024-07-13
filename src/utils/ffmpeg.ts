import Ffmpeg from 'fluent-ffmpeg';

export const trimVideo = ({ inputPath, outputPath, start, end }: { inputPath: string; outputPath: string; start: number; end: number }) => {
  return new Promise((respect, disrespect) => {
    Ffmpeg(inputPath)
      .setStartTime(start)
      .setDuration(end - start)
      .output(outputPath)
      .on('end', () => {
        respect(true);
      })
      .on('error', (err) => {
        disrespect(err);
      })
      .run();
  });
};
