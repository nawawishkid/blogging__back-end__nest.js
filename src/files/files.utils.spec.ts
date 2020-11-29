import { nameUploadedFile } from './files.utils';

function generateRegExp(name: string, ext: string): RegExp {
  return new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${name}-\\d{13}\\.${ext}$`, `g`);
}

function makeMulterFile(name: string, ext: string): Express.Multer.File {
  return { originalname: name + '.' + ext } as Express.Multer.File;
}

describe(`Files module utilities`, () => {
  describe(`nameUploadedFile()`, () => {
    let callback: jest.Mock<(err: Error, name: string) => void>;

    beforeEach(() => {
      callback = jest.fn();
    });

    function shouldReturnCorrectName(name, ext) {
      it(`should return correct name`, () => {
        const file = makeMulterFile(name, ext);
        const regex = generateRegExp(name, ext);

        nameUploadedFile(null, file, callback);

        expect(callback).toHaveBeenCalledWith(
          null,
          expect.stringMatching(regex),
        );
      });
    }

    shouldReturnCorrectName(`lorem`, `png`);
    shouldReturnCorrectName(`lorem.dot.dot.dot`, `png`);
    shouldReturnCorrectName(`lorem.dot.dot.dot...dot--name`, `png`);
    shouldReturnCorrectName(`ภาษาไทยก็ได้นะจ๊ะ`, `png`);
  });
});
