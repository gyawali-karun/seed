import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({
    type: 'string',
    example: '',
  })
  @IsString()
  firstName?: string;

  @ApiProperty({
    type: 'string',
    example: '',
  })
  @IsString()
  lastName?: string;
}

export class RegisterUserDto {
  @ApiProperty({
    type: 'string',
    required: true,
    example: '',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: 'string',
    required: true,
    example: '',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    type: () => CreateProfileDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile?: CreateProfileDto;
}

export class LoginUserDto extends PartialType(RegisterUserDto) {}
