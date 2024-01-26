export class Notification<T> {
  constructor(
    public message: string,
    public type: NotificationTipo,
    public data: T,
    public createdAt: Date,
  ) {}
}

export enum NotificationTipo {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
