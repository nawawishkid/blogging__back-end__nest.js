import { escapeRegExp } from 'lodash';
import {
  ER_NO_REFERENCED_ROW_2,
  ER_DUP_ENTRY,
} from 'mysql/lib/protocol/constants/errors';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomFieldValueNotFoundException } from '../custom-field-values/exceptions/custom-field-value-not-found.exception';
import {
  DeleteResult,
  InsertResult,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogCustomField } from './entities/blog-custom-field.entity';
import { Blog } from './entities/blog.entity';
import { BlogNotFoundException } from './exceptions/blog-not-found.exception';
import { DuplicatedBlogCustomFieldException } from './exceptions/duplicated-blog-custom-field.exception copy';

describe('BlogsService', () => {
  let service: BlogsService,
    blogsRepository: Repository<Blog>,
    blogCustomFieldsRepository: Repository<BlogCustomField>;

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
            update: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BlogCustomField),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
    blogsRepository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
    blogCustomFieldsRepository = module.get<Repository<BlogCustomField>>(
      getRepositoryToken(BlogCustomField),
    );
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
    let createBlogDto: CreateBlogDto, createdBlog: Blog;

    beforeEach(() => {
      createBlogDto = {
        title: `ok`,
        customFieldValueIds: [1, 2, 3],
        authorId: 1,
      };
      createdBlog = { id: `randomstring` } as Blog;
    });

    it(`should return created blog`, () => {
      delete createBlogDto.customFieldValueIds;

      jest.spyOn(blogsRepository, 'save').mockResolvedValue(createdBlog);
      jest.spyOn(service, 'findOne').mockResolvedValue(createdBlog);

      return expect(service.create(createBlogDto)).resolves.toBe(createdBlog);
    });

    it(`should assign uuid to the blog`, async () => {
      let receivedId;

      jest.spyOn(blogsRepository, 'save').mockImplementation(data => {
        receivedId = data.id;

        return Promise.resolve({} as Blog);
      });

      await service.create(createBlogDto);

      expect(receivedId).toEqual(expect.any(String));
    });

    it(`should create blog custom field`, async () => {
      let receivedBlogCustomFieldEntities;

      jest.spyOn(blogsRepository, 'save').mockResolvedValue(createdBlog);
      jest
        .spyOn(blogCustomFieldsRepository, 'insert')
        .mockImplementation(data => {
          receivedBlogCustomFieldEntities = data;

          return Promise.resolve({} as InsertResult);
        });

      await service.create(createBlogDto);

      expect(receivedBlogCustomFieldEntities).toEqual(
        expect.arrayContaining(
          createBlogDto.customFieldValueIds.map<BlogCustomField>(id => ({
            blogId: createdBlog.id,
            customFieldValueId: id,
          })),
        ),
      );
    });

    it(`should throw CustomFieldValueNotFoundException`, () => {
      const error: any = new QueryFailedError('lorem', [], []);

      error.errno = ER_NO_REFERENCED_ROW_2;

      jest.spyOn(blogsRepository, 'save').mockResolvedValue(createdBlog);
      jest.spyOn(blogCustomFieldsRepository, 'insert').mockRejectedValue(error);

      return expect(service.create(createBlogDto)).rejects.toThrow(
        CustomFieldValueNotFoundException,
      );
    });

    it(`should throw DuplicatedBlogCustomFieldException`, () => {
      const error: any = new QueryFailedError('lorem', [], []);

      error.errno = ER_DUP_ENTRY;

      jest.spyOn(blogsRepository, 'save').mockResolvedValue(createdBlog);
      jest.spyOn(blogCustomFieldsRepository, 'insert').mockRejectedValue(error);

      return expect(service.create(createBlogDto)).rejects.toThrow(
        DuplicatedBlogCustomFieldException,
      );
    });

    it(`should throw what blogs repository throws`, () => {
      delete createBlogDto.customFieldValueIds;

      const error = new Error();

      jest.spyOn(blogsRepository, 'save').mockRejectedValue(error);

      return expect(service.create(createBlogDto)).rejects.toThrow(error);
    });

    it(`should throw what blog custom fields repository throws`, () => {
      const error = new Error();

      jest.spyOn(blogsRepository, 'save').mockResolvedValue(createdBlog);
      jest.spyOn(blogCustomFieldsRepository, 'insert').mockRejectedValue(error);

      return expect(service.create(createBlogDto)).rejects.toThrow(error);
    });
  });

  describe(`update(updateBlogDto: UpdateBlogDto)`, () => {
    let updateBlogDto: UpdateBlogDto, updatedBlog: Blog;

    beforeEach(() => {
      updateBlogDto = {
        customFieldValueIds: [1, 2, 3],
      };
      updatedBlog = { id: `randomstring` } as Blog;
    });

    it(`should return updated blog`, () => {
      const updateBlogDto = {} as UpdateBlogDto;
      const updatedBlog = {} as Blog;

      jest
        .spyOn(blogsRepository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(blogsRepository, 'findOne').mockResolvedValue(updatedBlog);

      return expect(
        service.update('blog-id', updateBlogDto),
      ).resolves.toStrictEqual(updatedBlog);
    });

    it(`should create blog custom field`, async () => {
      const id = 'id';
      let receivedBlogCustomFieldEntities;

      jest
        .spyOn(blogsRepository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);
      jest
        .spyOn(blogCustomFieldsRepository, 'insert')
        .mockImplementation(data => {
          receivedBlogCustomFieldEntities = data;

          return Promise.resolve({} as InsertResult);
        });

      await service.update(id, updateBlogDto);

      expect(receivedBlogCustomFieldEntities).toEqual(
        expect.arrayContaining(
          updateBlogDto.customFieldValueIds.map<BlogCustomField>(cfvid => ({
            blogId: id,
            customFieldValueId: cfvid,
          })),
        ),
      );
    });

    it(`should throw the BlogNotFoundException if given blog id could not be found (no upsert)`, () => {
      jest
        .spyOn(blogsRepository, 'update')
        .mockResolvedValue({ affected: 0 } as UpdateResult);

      return expect(
        service.update('blog-not-found', {} as UpdateBlogDto),
      ).rejects.toThrow(BlogNotFoundException);
    });

    it(`should throw CustomFieldValueNotFoundException`, () => {
      const id = 'id';
      const error: any = new QueryFailedError('lorem', [], []);

      error.errno = ER_NO_REFERENCED_ROW_2;

      jest
        .spyOn(blogsRepository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(blogCustomFieldsRepository, 'insert').mockRejectedValue(error);

      return expect(service.update(id, updateBlogDto)).rejects.toThrow(
        CustomFieldValueNotFoundException,
      );
    });

    it(`should throw DuplicatedBlogCustomFieldException`, () => {
      const error: any = new QueryFailedError('lorem', [], []);

      error.errno = ER_DUP_ENTRY;

      jest
        .spyOn(blogsRepository, 'update')
        .mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(blogCustomFieldsRepository, 'insert').mockRejectedValue(error);

      return expect(service.update('lorem', updateBlogDto)).rejects.toThrow(
        DuplicatedBlogCustomFieldException,
      );
    });

    it(`should throw what blog custom fields repository throws`, () => {
      const error = new Error();

      jest.spyOn(blogsRepository, 'update').mockRejectedValue(error);

      return expect(service.update('id', updateBlogDto)).rejects.toThrow(error);
    });
  });

  describe(`remove(blogId: string)`, () => {
    it(`should return removed blog id`, () => {
      const blogId = 'blog-id';

      jest
        .spyOn(blogsRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      return expect(service.remove(blogId)).resolves.toBe(blogId);
    });

    it(`should throw BlogNotFoundException if given blog id could not be found`, () => {
      jest
        .spyOn(blogsRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);

      return expect(service.remove('hahaha')).rejects.toThrow(
        BlogNotFoundException,
      );
    });
  });

  describe(`search(keyword:string)`, () => {
    it(`should return an array of found blogs`, async () => {
      const keyword: string = 'keyword';
      const foundBlogs: Blog[] = [{}, {}] as Blog[];
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(foundBlogs),
      };

      jest
        .spyOn(blogsRepository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any);

      await expect(service.search(keyword)).resolves.toEqual(foundBlogs);

      expect(queryBuilder.where).toHaveBeenCalledWith(expect.any(String), {
        keyword: `^.*${escapeRegExp(keyword)}.*$`,
      });
    });
  });
});
