import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { BlogNotFoundException } from './exceptions/blog-not-found.exception';

describe('BlogsService', () => {
  let service: BlogsService, blogsRepository: Repository<Blog>;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: getRepositoryToken(Blog),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
    blogsRepository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`findByAuthorId(userId: number)`, () => {
    it(`should return all blogs of the user with given id`, async () => {
      const authorId = 1;
      const foundBlogs: Blog[] = [{ id: 'blog-1' }, { id: 'blog-2' }] as Blog[];
      let receivedAuthorId;

      jest
        .spyOn(blogsRepository, 'find')
        .mockImplementation((condition: any) => {
          receivedAuthorId = condition.where.author;

          return Promise.resolve(foundBlogs);
        });

      await expect(service.findByAuthorId(authorId)).resolves.toBe(
        await blogsRepository.find({ where: { author: authorId } }),
      );
      expect(receivedAuthorId).toEqual(authorId);
    });

    it(`should return undefined if the user has no blog`, () => {
      jest.spyOn(blogsRepository, 'find').mockResolvedValue(undefined);

      return expect(service.findByAuthorId(1)).resolves.toBeUndefined();
    });
  });

  describe(`findOne(blogId: string)`, () => {
    it(`should return a blog with given id`, () => {
      const foundBlog = {} as Blog;

      jest.spyOn(blogsRepository, 'findOne').mockResolvedValue(foundBlog);

      return expect(service.findOne('blog-1')).resolves.toBe(foundBlog);
    });

    it(`should return undefined if a blog with given id could not be found`, () => {
      jest.spyOn(blogsRepository, 'findOne').mockResolvedValue(undefined);

      return expect(service.findOne('blog-1')).resolves.toBeUndefined();
    });
  });

  describe(`create(createBlogDto: CreateBlogDto)`, () => {
    it(`should return created blog`, () => {
      const createBlogDto = {} as CreateBlogDto;
      const createdBlog = {} as Blog;

      jest.spyOn(blogsRepository, 'save').mockResolvedValue(createdBlog);

      return expect(service.create(createBlogDto)).resolves.toBe(createdBlog);
    });

    it(`should throw what blogs repository throws`, () => {
      const createBlogDto = {} as CreateBlogDto;
      const error = new Error();

      jest.spyOn(blogsRepository, 'save').mockRejectedValue(error);

      return expect(service.create(createBlogDto)).rejects.toThrow(error);
    });
  });

  describe(`update(updateBlogDto: UpdateBlogDto)`, () => {
    it(`should return updated blog`, () => {
      const updateBlogDto = {} as UpdateBlogDto;
      const updatedBlog = {} as Blog;

      jest.spyOn(blogsRepository, 'save').mockResolvedValue(updatedBlog);

      return expect(service.update('blog-id', updateBlogDto)).resolves.toBe(
        updatedBlog,
      );
    });

    it(`should throw the BlogNotFoundException if given blog id could not be found (no upsert)`, () => {
      jest
        .spyOn(blogsRepository, 'save')
        .mockRejectedValue(new BlogNotFoundException());

      return expect(
        service.update('blog-not-found', {} as UpdateBlogDto),
      ).rejects.toThrow(BlogNotFoundException);
    });
  });

  describe(`remove(blogId: string)`, () => {
    it(`should return removed blog id`, () => {
      const blogId = 'blog-id';

      jest
        .spyOn(blogsRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      return expect(service.remove(blogId)).resolves.toBe(blogId);
    });

    it(`should throw BlogNotFoundException if given blog id could not be found`, () => {
      jest
        .spyOn(blogsRepository, 'delete')
        .mockResolvedValue({ affected: null } as DeleteResult);

      return expect(service.remove('hahaha')).rejects.toThrow(
        BlogNotFoundException,
      );
    });
  });
});
