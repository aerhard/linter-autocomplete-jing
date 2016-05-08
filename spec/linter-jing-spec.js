'use babel';

import linter from '../lib/linter-jing';
import path from 'path';

const xmlPath = (filename) => path.resolve(__dirname, `xml/${filename}`);

describe('linter-jing', () => {
  const lint = linter.provideLinter().lint;

  describe('lint', () => {
    const testLinter = (basename, cb) =>
      waitsForPromise(() =>
        atom.workspace.open(xmlPath(basename))
          .then((editor) =>
            lint(editor)
              .then(cb)
              .then(() => {
                const pane = atom.workspace.paneForItem(editor);
                pane.destroyItem(editor);
              })
          )
      );

    beforeEach(() => {
      waitsForPromise(() =>
        atom.packages.activatePackage('linter-jing')
      );
    });

    describe('given an empty file', () => {
      it('returns an array containing an error message', () => {
        testLinter('empty.xml', (messages) => {
          expect(Array.isArray(messages)).toBe(true);
          expect(messages.length).toEqual(1);
          expect(messages[0].type).toEqual('Error');
        });
      });
    });

    describe('given a not well-formed file', () => {
      it('returns an array containing an error message', () => {
        testLinter('notwellformed.xml', (messages) => {
          expect(Array.isArray(messages)).toBe(true);
          expect(messages.length).toEqual(1);
          expect(messages[0].type).toEqual('Error');
        });
      });
    });

    describe('given a well-formed xml document without schema references', () => {
      it('returns an empty array', () => {
        testLinter('wellformed.xml', (messages) => {
          expect(Array.isArray(messages)).toBe(true);
          expect(messages.length).toEqual(0);
        });
      });
    });

    describe('given a well-formed xml document with an unknown schema type', () => {
      it('returns a warning', () => {
        testLinter('unknown-schematype.xml', (messages) => {
          expect(Array.isArray(messages)).toBe(true);
          expect(messages.length).toEqual(1);
          expect(messages[0].type).toEqual('Warning');
        });
      });
    });

    describe('given a well-formed xml document with a correct ' +
      'reference to a valid RNC schema', () => {
      describe('when the document is valid', () => {
        it('returns an empty array', () => {
          testLinter('rng-valid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(0);
          });
        });
      });

      describe('when the document contains five validation errors', () => {
        it('returns an array of length 5', () => {
          testLinter('rng-invalid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(5);
          });
        });
      });
    });

    describe('given a well-formed xml document with a correct ' +
      'reference to a valid RNC schema', () => {
      describe('when the document is valid', () => {
        it('returns an empty array', () => {
          testLinter('rnc-valid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(0);
          });
        });
      });

      describe('when the document contains five validation errors', () => {
        it('returns an array of length 5', () => {
          testLinter('rnc-invalid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(5);
          });
        });
      });
    });

    describe('given a well-formed xml document with a correct ' +
      'reference to a valid XSD schema', () => {
      describe('when the document is valid', () => {
        it('returns an empty array', () => {
          testLinter('xsd-valid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(0);
          });
        });
      });

      describe('when the document contains six validation errors', () => {
        it('returns an array of length 6', () => {
          testLinter('xsd-invalid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(6);
          });
        });
      });
    });

    describe('given a well-formed xml document with a correct ' +
      'reference to a valid ISO schematron schema', () => {
      describe('when the document is valid', () => {
        it('returns an empty array', () => {
          testLinter('iso-sch-valid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(0);
          });
        });
      });

      describe('when the document contains three validation errors', () => {
        it('returns an array of length 3', () => {
          testLinter('iso-sch-invalid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(3);
          });
        });
      });
    });

    describe('given a well-formed xml document with a correct ' +
      'reference to a valid schematron 1.5 schema', () => {
      describe('when the document is valid', () => {
        it('returns an empty array', () => {
          testLinter('15-sch-valid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(0);
          });
        });
      });

      describe('when the document contains three validation errors', () => {
        it('returns an array of length 3', () => {
          testLinter('15-sch-invalid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(3);
          });
        });
      });
    });

    describe('given a well-formed xml document with a correct ' +
      'reference to a valid RNG and a valid iso schematron schema', () => {
      describe('when the document is valid', () => {
        it('returns an empty array', () => {
          testLinter('rng-iso-sch-valid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(0);
          });
        });
      });

      describe('when the document contains eight validation errors', () => {
        it('returns an array of length 8', () => {
          testLinter('rng-iso-sch-invalid.xml', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toEqual(8);
          });
        });
      });
    });
  });
});
