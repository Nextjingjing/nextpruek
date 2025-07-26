export class UserResponseDto {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  address: string | null;
  phone: String | null;
  isAdmin: boolean;
}
