import { Blog } from '../entities/blog.entity';

export class CreateBlogResponseDto {
  createdBlog: Blog;
}

export class UpdateBlogResponseDto {
  updatedBlog: Blog;
}

export class FindAllBlogsResponseDto {
  blogs: Blog[];
}

export class FindOneBlogResponseDto {
  blog: Blog;
}
