import { IsString, IsEmail, IsPhoneNumber, IsOptional, Matches } from 'class-validator';

export class UserEditDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsPhoneNumber('TH', { message: 'Phone must be a valid Thai phone number (e.g. +66...) with 10 digits' })
  phone?: string;

  @IsOptional()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'dateOfBirth must be in DD/MM/YYYY format',
  })
  dateOfBirth?: string;

}
