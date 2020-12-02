import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  HttpCode,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { User as UserEntity } from '../users/entities/user.entity';
import { User } from '../users/user.decorator';
import { BlogsService } from './blogs.service';
import { CreateBlogRequestBodyDto } from './dto/create-blog-request-body.dto';
import { UpdateBlogRequestBodyDto } from './dto/update-blog-request-body.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import {
  CreateBlogResponseDto,
  FindAllBlogsResponseDto,
  FindOneBlogResponseDto,
  UpdateBlogResponseDto,
} from './dto/response.dto';
import { Blog } from './entities/blog.entity';
import { BlogNotFoundException } from './exceptions/blog-not-found.exception';
import { CustomFieldValueNotFoundException } from '../custom-field-values/exceptions/custom-field-value-not-found.exception';
import { DuplicatedBlogCustomFieldException } from './exceptions/duplicated-blog-custom-field.exception copy';

@UseGuards(AuthGuard)
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  async create(
    @User() user: UserEntity,
    @Body() createBlogRequestBodyDto: CreateBlogRequestBodyDto,
  ): Promise<CreateBlogResponseDto> {
    const createBlogDto: CreateBlogDto = {
      authorId: user.id,
      ...createBlogRequestBodyDto,
    };

    try {
      const createdBlog = await this.blogsService.create(createBlogDto);

      return { createdBlog };
    } catch (e) {
      if (
        e instanceof DuplicatedBlogCustomFieldException ||
        e instanceof CustomFieldValueNotFoundException
      )
        throw new BadRequestException(e);

      throw e;
    }
  }

  @Get()
  async findAll(@User() user: UserEntity): Promise<FindAllBlogsResponseDto> {
    const foundBlogs: Blog[] = await this.blogsService.findByAuthorId(user.id);

    if (!foundBlogs) throw new NotFoundException();

    return { blogs: foundBlogs };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneBlogResponseDto> {
    const foundBlog: Blog = await this.blogsService.findOne(id);

    if (!foundBlog) throw new NotFoundException();

    return { blog: foundBlog };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogRequestBodyDto,
  ): Promise<UpdateBlogResponseDto> {
    try {
      const updatedBlog: Blog = await this.blogsService.update(
        id,
        updateBlogDto,
      );

      return { updatedBlog };
    } catch (e) {
      if (e instanceof BlogNotFoundException) throw new NotFoundException(e);
      if (e instanceof DuplicatedBlogCustomFieldException)
        throw new BadRequestException(e);
      if (e instanceof CustomFieldValueNotFoundException)
        throw new BadRequestException(e);

      throw e;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.blogsService.remove(id);
    } catch (e) {
      if (e instanceof BlogNotFoundException) throw new NotFoundException();

      throw e;
    }
  }
}
