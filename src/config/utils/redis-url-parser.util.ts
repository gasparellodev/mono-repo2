import { RedisOptions } from 'ioredis';

export const redisUrlParser = (url: string): RedisOptions => {
  if (url.includes('://:')) {
    const arr = url.split('://:')[1].split('@');
    const secondArr = arr[1].split(':');

    return {
      password: arr[0],
      host: secondArr[0],
      port: parseInt(secondArr[1], 10),
    };
  }

  const connectionString = url.split('://')[1];
  const arr = connectionString.split(':');
  const passAndHost = arr[1].split('@');
  return {
    host: passAndHost[1],
    username: arr[0],
    password: passAndHost[0],
    port: parseInt(arr[2], 10),
  };
};
