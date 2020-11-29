import { nanoid } from 'nanoid';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { BlogNotFoundException } from './exceptions/blog-not-found.exception';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private blogsRepository: Repository<Blog>,
  ) {}

  create(createBlogDto: CreateBlogDto) {
    return this.blogsRepository.save({ ...createBlogDto, id: nanoid() });
  }

  async findByAuthorId(userId: number): Promise<Blog[]> | undefined {
    const foundBlogs: Blog[] = await this.blogsRepository.find({
      where: { authorId: userId },
    });

    if (!foundBlogs || (Array.isArray(foundBlogs) && foundBlogs.length === 0))
      return undefined;

    return foundBlogs;
  }

  findOne(id: string): Promise<Blog> | undefined {
    return this.blogsRepository.findOne(id);
  }

  async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<Blog> | undefined {
    const updateResult: UpdateResult = await this.blogsRepository.update(
      id,
      updateBlogDto,
    );

    if (updateResult.affected === 0) throw new BlogNotFoundException();

    return this.findOne(id);
  }

  async remove(id: string): Promise<string> {
    const deleteResult: DeleteResult = await this.blogsRepository.delete(id);

    if (deleteResult.affected === null) throw new BlogNotFoundException();

    return id;
  }
}
