import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
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
    return this.blogsRepository.save(createBlogDto);
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
    const updatedBlog: Blog = await this.blogsRepository.save({
      id,
      ...updateBlogDto,
    });

    if (!updatedBlog) return undefined;

    return updatedBlog;
  }

  async remove(id: string): Promise<string> {
    const deleteResult: DeleteResult = await this.blogsRepository.delete(id);

    if (deleteResult.affected === null) throw new BlogNotFoundException();

    return id;
  }
}
