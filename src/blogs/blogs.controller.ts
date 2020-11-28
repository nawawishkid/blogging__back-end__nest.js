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
} from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { User as UserEntity } from '../users/entities/user.entity';
import { User } from '../users/user.decorator';
import { BlogsService } from './blogs.service';
import { CreateBlogRequestBodyDto } from './dto/create-blog-request-body.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import {
  CreateBlogResponseDto,
  FindAllBlogsResponseDto,
  FindOneBlogResponseDto,
  UpdateBlogResponseDto,
} from './dto/response.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { BlogNotFoundException } from './exceptions/blog-not-found.exception';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @User() user: UserEntity,
    @Body() createBlogRequestBodyDto: CreateBlogRequestBodyDto,
  ): Promise<CreateBlogResponseDto> {
    const createBlogDto: CreateBlogDto = {
      authorId: user.id,
      ...createBlogRequestBodyDto,
    };

    const createdBlog = await this.blogsService.create(createBlogDto);

    return { createdBlog };
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@User() user: UserEntity): Promise<FindAllBlogsResponseDto> {
    const foundBlogs: Blog[] = await this.blogsService.findByAuthorId(user.id);

    if (!foundBlogs) throw new NotFoundException();

    return { blogs: foundBlogs };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneBlogResponseDto> {
    const foundBlog: Blog = await this.blogsService.findOne(id);

    if (!foundBlog) throw new NotFoundException();

    return { blog: foundBlog };
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<UpdateBlogResponseDto> {
    try {
      const updatedBlog: Blog = await this.blogsService.update(
        id,
        updateBlogDto,
      );

      return { updatedBlog };
    } catch (e) {
      if (e instanceof BlogNotFoundException) throw new NotFoundException();

      throw e;
    }
  }

  @UseGuards(AuthGuard)
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
