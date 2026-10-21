import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { SignInDto } from './sign-in.dto.js';

export class SignUpDto extends SignInDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @MinLength(8)
  @Matches(/[a-zA-Z]/, { message: 'password must contain at least one letter' })
  @Matches(/[0-9]/, { message: 'password must contain at least one number' })
  @Matches(/[^a-zA-Z0-9\s]/, {
    message: 'password must contain at least one special character',
  })
  declare password: string;
}
