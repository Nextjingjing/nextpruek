import { IsString, IsEmail, IsPhoneNumber, Matches, IsNotEmpty } from 'class-validator';

export class UserUpdateDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsPhoneNumber('TH', { message: 'Phone must be a valid Thai phone number (e.g. +66...) with 10 digits' })
  phone: string;

  @IsNotEmpty()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'dateOfBirth must be in DD/MM/YYYY format',
  })
  dateOfBirth: string;

}
