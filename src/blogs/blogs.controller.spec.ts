import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomFieldValueNotFoundException } from '../custom-field-values/exceptions/custom-field-value-not-found.exception';
import { User } from 'src/users/entities/user.entity';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CreateBlogRequestBodyDto } from './dto/create-blog-request-body.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogRequestBodyDto } from './dto/update-blog-request-body.dto';
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

    it(`should assign authorId`, async () => {
      const user: User = { id: 123 } as User;
      let receivedAuthorId;

      jest.spyOn(blogsService, 'create').mockImplementation(data => {
        receivedAuthorId = data.authorId;

        return Promise.resolve({} as Blog);
      });
      await controller.create(user, {} as CreateBlogRequestBodyDto);

      expect(receivedAuthorId).toEqual(user.id);
    });

    it(`should throw BadRequestException`, () => {
      const createBlogRequestDto: CreateBlogRequestBodyDto = {
        title: 'ok',
        customFieldValueIds: [1, 2, 3],
      };

      jest
        .spyOn(blogsService, 'create')
        .mockRejectedValue(new CustomFieldValueNotFoundException());

      return expect(
        controller.create({} as User, createBlogRequestDto),
      ).rejects.toThrow(BadRequestException);
    });

    it(`should throw what is thrown by the blogs service`, () => {
      const error = new Error();

      jest.spyOn(blogsService, 'create').mockRejectedValue(error);

      return expect(
        controller.create({} as User, {} as CreateBlogRequestBodyDto),
      ).rejects.toThrow(error);
    });
  });

  describe(`update(blogId: string, updateBlogDto: UpdateBlogRequestBodyDto)`, () => {
    it(`should return updated blog`, () => {
      const updatedBlog = {} as Blog;

      jest.spyOn(blogsService, 'update').mockResolvedValue(updatedBlog);

      return expect(
        controller.update('blog-id', {} as UpdateBlogRequestBodyDto),
      ).resolves.toEqual({ updatedBlog });
    });

    it(`should throw the NotFoundException if the blog with the given id could not be found`, () => {
      jest
        .spyOn(blogsService, 'update')
        .mockRejectedValue(new BlogNotFoundException());

      return expect(
        controller.update('blog-id', {} as UpdateBlogRequestBodyDto),
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
