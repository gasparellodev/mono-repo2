import * as path from 'path';

import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';

import { EnableNotificationDto } from './dto/enable-notification.dto';

firebase.initializeApp({
  credential: firebase.credential.cert(
    path.join(__dirname, '..', '..', 'firebase-sdk.json'),
  ),
});
@Injectable()
export class NotificationsService {
  public async enableNotification(
    id: string,
    data: EnableNotificationDto,
  ): Promise<void> {}
}
