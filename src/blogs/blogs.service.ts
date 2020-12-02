import { ER_NO_REFERENCED_ROW_2 } from 'mysql/lib/protocol/constants/errors';
import { nanoid } from 'nanoid';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { BlogNotFoundException } from './exceptions/blog-not-found.exception';
import { BlogCustomField } from './entities/blog-custom-field.entity';
import { CustomFieldValueNotFoundException } from '../custom-field-values/exceptions/custom-field-value-not-found.exception';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private blogsRepository: Repository<Blog>,
    @InjectRepository(BlogCustomField)
    private blogCustomFieldsRepository: Repository<BlogCustomField>,
  ) {}

  /**
   * @TODO Should I use cascading?
   */
  async create(createBlogDto: CreateBlogDto) {
    const { customFieldValueIds, ...b } = createBlogDto;
    const blog: Blog = new Blog();

    Object.assign(blog, b);

    blog.id = nanoid();

    const createdBlog: Blog = await this.blogsRepository.save(blog);

    if (!customFieldValueIds || customFieldValueIds.length === 0)
      return this.findOne(createdBlog.id);

    const blogCustomFields = customFieldValueIds.map(id => {
      const bcf: BlogCustomField = new BlogCustomField();

      bcf.blogId = createdBlog.id;
      bcf.customFieldValueId = id;

      return bcf;
    });

    try {
      await this.blogCustomFieldsRepository.save(blogCustomFields);

      return this.findOne(createdBlog.id);
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        (e as any).errno === ER_NO_REFERENCED_ROW_2
      )
        throw new CustomFieldValueNotFoundException();

      throw e;
    }
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
    return this.blogsRepository.findOne(id, {
      relations: [`blogCustomFields`, `author`],
    });
  }

  async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<Blog> | undefined {
    const { customFieldValueIds, ...b } = updateBlogDto;
    const blog: Blog = new Blog();

    Object.assign(blog, b);

    if (Array.isArray(customFieldValueIds) && customFieldValueIds.length) {
      blog.blogCustomFields = customFieldValueIds.map(cfvid => {
        const bcf: BlogCustomField = new BlogCustomField();

        bcf.blogId = id;
        bcf.customFieldValueId = cfvid;

        return bcf;
      });
    }

    try {
      const updateResult: UpdateResult = await this.blogsRepository.update(
        id,
        blog,
      );

      if (updateResult.affected === 0) throw new BlogNotFoundException();

      return this.findOne(id);
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        (e as any).errno === ER_NO_REFERENCED_ROW_2
      )
        throw new CustomFieldValueNotFoundException();

      throw e;
    }
  }

  async remove(id: string): Promise<string> {
    const deleteResult: DeleteResult = await this.blogsRepository.delete(id);

    if (deleteResult.affected === 0) throw new BlogNotFoundException();

    return id;
  }
}
