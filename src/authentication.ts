import crypto from 'crypto';
import { Document, WithId } from 'mongodb';

export default function passwordComparison(row: WithId<Document>, hash: Buffer) {
  if (!crypto.timingSafeEqual(Buffer.from(row.password), hash)) {
    return { message: 'Incorrect username or password.' };
  }
  return row;
}
