import getEnvVar from 'env/index';

const StorageConfig = {
  fileLocation: (userId: string, fileId: string, fileName: string) => `${getEnvVar('STORAGE_PATH')}/${userId}/${fileId}/${fileName}`,
};

export default StorageConfig;
