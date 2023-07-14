import { Injectable } from '@nestjs/common';
import { AWSError, Endpoint, S3 } from 'aws-sdk';

@Injectable()
export class StorageService {
  s3Client = new S3({
    endpoint: new Endpoint('nyc3.digitaloceanspaces.com'),
  });

  async upload(file_name: string, file: Buffer) {
    return new Promise((resolve, reject) => {
      this.s3Client.putObject(
        {
          Bucket: 'eujogo-images',
          Key: file_name,
          Body: file,
          ACL: 'public-read',
        },
        (error: AWSError) => {
          if (!error) {
            resolve(
              `https://eujogo-images.nyc3.cdn.digitaloceanspaces.com/${file_name}`,
            );
          } else {
            reject(
              new Error(
                `DoSpacesService_ERROR: ${
                  error.message || 'Something went wrong'
                }`,
              ),
            );
          }
        },
      );
    });
  }
}
