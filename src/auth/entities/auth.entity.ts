export class UserEntity {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: ProfileEntity;
}

export class ProfileEntity {
  id: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: UserEntity;
}
