import { Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { User } from '../../database/entities/user.entity';
import { NotFoundException } from '../../exceptions/not-found.exception';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(
        `Not found user with ID: ${id}`,
        'USER_NOT_FOUND',
      );
    }

    return user;
  }

  async existByEmail(email: string) {
    return await this.userRepository.findOneByEmail(email);
  }

  async existByUsername(username: string) {
    return await this.userRepository.findOneByUsername(username);
  }

  async create(data: CreateUserDto): Promise<User> {
    return await this.userRepository.create(data);
  }
}
