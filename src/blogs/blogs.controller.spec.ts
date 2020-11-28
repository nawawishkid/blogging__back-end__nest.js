import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/users/entities/user.entity';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { BlogNotFoundException } from './exceptions/blog-not-found.exception';

describe('BlogsController', () => {
  let controller: BlogsController, blogsService: BlogsService;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: {
            findOne: jest.fn(),
            findByAuthorId: jest.fn(),
            remove: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
    blogsService = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(`findAll(user: User)`, () => {
    it(`should return all blogs of given user object`, () => {
      const foundBlogs = [{ id: '1' }, { id: '2' }] as Blog[];

      jest.spyOn(blogsService, 'findByAuthorId').mockResolvedValue(foundBlogs);

      return expect(controller.findAll({} as User)).resolves.toEqual({
        blogs: foundBlogs,
      });
    });

    it(`should throw NotFoundException if the given user has no blogs`, () => {
      jest.spyOn(blogsService, 'findByAuthorId').mockResolvedValue(undefined);

      return expect(controller.findAll({} as User)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe(`findOne(blogId: string)`, () => {
    it(`should return the blog with the given id`, () => {
      const foundBlog = {} as Blog;

      jest.spyOn(blogsService, 'findOne').mockResolvedValue(foundBlog);

      return expect(controller.findOne('id')).resolves.toEqual({
        blog: foundBlog,
      });
    });

    it(`should throw NotFoundException if the blog with the given id could not be found`, () => {
      jest.spyOn(blogsService, 'findOne').mockResolvedValue(undefined);

      return expect(controller.findOne('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe(`create(user: User, createBlogDto: CreateBlogDto)`, () => {
    it(`should return created blog`, () => {
      const createdBlog = {} as Blog;

      jest.spyOn(blogsService, 'create').mockResolvedValue(createdBlog);

      return expect(
        controller.create({} as User, {} as CreateBlogDto),
      ).resolves.toEqual({ createdBlog });
    });
  });

  describe(`update(blogId: string, updateBlogDto: UpdateBlogDto)`, () => {
    it(`should return updated blog`, () => {
      const updatedBlog = {} as Blog;

      jest.spyOn(blogsService, 'update').mockResolvedValue(updatedBlog);

      return expect(
        controller.update('blog-id', {} as UpdateBlogDto),
      ).resolves.toEqual({ updatedBlog });
    });

    it(`should throw the NotFoundException if the blog with the given id could not be found`, () => {
      jest
        .spyOn(blogsService, 'update')
        .mockRejectedValue(new BlogNotFoundException());

      return expect(
        controller.update('blog-id', {} as UpdateBlogDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe(`remove(blogId: string)`, () => {
    it(`should return nothing if successfully remove`, () => {
      jest.spyOn(blogsService, 'remove').mockResolvedValue('blog-id');

      return expect(controller.remove('blog-id')).resolves.toBeUndefined();
    });

    it(`should throw the NotFoundException if the blog with the given id could not be found`, () => {
      jest
        .spyOn(blogsService, 'remove')
        .mockRejectedValue(new BlogNotFoundException());

      return expect(controller.remove('blog-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
