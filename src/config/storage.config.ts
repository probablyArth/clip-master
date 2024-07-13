import getEnvVar from 'env/index';

const StorageConfig = {
  fileLocation: (userId: string) => `${getEnvVar('STORAGE_PATH')}/${userId}/`,
  fileSize: 25 * 1000000,
  relativeFileLocation: (userId: string, filename: string) => `/${userId}/${filename}`,
};

export default StorageConfig;
