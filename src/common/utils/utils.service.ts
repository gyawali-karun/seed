import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UtilsService {
  private readonly saltRounds = 10;
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async valdateUser(password: string, hashPassword: string) {
    const isValid = await bcrypt.compare(password, hashPassword);
    if (!isValid)
      throw new HttpException('Password not match', HttpStatus.NOT_FOUND);

    return;
  }
}
