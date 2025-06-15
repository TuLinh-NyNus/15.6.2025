import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { User, UserRole } from '@project/entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserRepository } from '@project/interfaces';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Tạo người dùng mới
   * @param createUserDto Thông tin người dùng
   * @returns Thông tin người dùng đã tạo
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.create({
      email: createUserDto.email,
      password: createUserDto.password,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role || UserRole.STUDENT,
    });
  }

  /**
   * Lấy danh sách người dùng
   * @returns Danh sách người dùng
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  /**
   * Tìm người dùng theo email
   * @param email Email cần tìm
   * @returns Thông tin người dùng hoặc null nếu không tìm thấy
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Tìm người dùng theo ID
   * @param id ID cần tìm
   * @returns Thông tin người dùng hoặc null nếu không tìm thấy
   */
  async findOne(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }
    return user;
  }

  /**
   * Cập nhật thông tin người dùng
   * @param id ID người dùng cần cập nhật
   * @param updateUserDto Thông tin cần cập nhật
   * @returns Thông tin người dùng sau khi cập nhật
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }
    
    return this.userRepository.update(id, {
      email: updateUserDto.email,
      password: updateUserDto.password,
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      role: updateUserDto.role,
    });
  }

  /**
   * Xóa người dùng
   * @param id ID người dùng cần xóa
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }
    
    await this.userRepository.delete(id);
  }
} 
