import { IsNumber, IsString } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name: string;
}

export class CreateTenantUserDto {
  @IsString()
  tenantId: string;

  @IsString()
  userId: string;

  @IsNumber()
  roleId: number;
}
