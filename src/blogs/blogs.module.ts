import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { BlogCustomField } from './entities/blog-custom-field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, BlogCustomField])],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}
