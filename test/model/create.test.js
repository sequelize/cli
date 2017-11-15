

const expect    = require('expect.js');
const Support   = require(__dirname + '/../support');
const helpers   = require(__dirname + '/../support/helpers');
const gulp      = require('gulp');
const _         = require('lodash');

[
  'model:create'
].forEach(flag => {
  describe(Support.getTestDialectTeaser(flag), () => {
    const combineFlags = function (flags) {
      let result = flag;

      _.forEach(flags || {}, (value, key) => {
        result = result + ' --' + key + ' ' + value;
      });

      return result;
    };

    const prepare = function (options, callback) {
      options = _.assign({
        flags: {},
        cli:   { pipeStdout: true }
      }, options || {});

      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init'))
        .pipe(helpers.runCli(combineFlags(options.flags), options.cli))
        .pipe(helpers.teardown(callback));
    };

    describe('name', () => {
      describe('when missing', () => {
        it('exits with an error code', done => {
          prepare({
            flags: { attributes: 'first_name:string' },
            cli: { exitCode: 1 }
          }, done);
        });

        it('notifies the user about a missing name flag', done => {
          prepare({
            flags: { attributes: 'first_name:string' },
            cli: { pipeStderr: true }
          }, (err, stdout) => {
            expect(stdout).to.match(/Missing required argument: name/);
            done();
          });
        });
      });
    });

    describe('attributes', () => {
      describe('when missing', () => {
        it('exits with an error code', done => {
          prepare({
            flags: { name: 'User' },
            cli: { exitCode: 1 }
          }, done);
        });

        it('notifies the user about a missing attributes flag', done => {
          prepare({
            flags: { name: 'User' },
            cli: { pipeStderr: true }
          }, (err, stdout) => {
            expect(stdout).to.match(/Missing required argument: attributes/);
            done();
          });
        });
      });

      ;[
        'first_name:string,last_name:string,bio:text,reviews:array:text',
        '\'first_name:string last_name:string bio:text reviews:array:text\'',
        '\'first_name:string, last_name:string, bio:text, reviews:array:text\''
      ].forEach(attributes => {
        describe('--attributes ' + attributes, () => {
          it('exits with exit code 0', done => {
            prepare({
              flags: { name: 'User', attributes },
              cli: { exitCode: 0 }
            }, done);
          });

          it('creates the model file', done => {
            prepare({
              flags: { name: 'User', attributes }
            }, () => {
              gulp
                .src(Support.resolveSupportPath('tmp', 'models'))
                .pipe(helpers.listFiles())
                .pipe(helpers.ensureContent('user.js'))
                .pipe(helpers.teardown(done));
            });
          });

          it('generates the model attributes correctly', done => {
            prepare({
              flags: { name: 'User', attributes }
            }, () => {
              gulp
                .src(Support.resolveSupportPath('tmp', 'models'))
                .pipe(helpers.readFile('user.js'))
                .pipe(helpers.ensureContent('sequelize.define(\'User\''))
                .pipe(helpers.ensureContent('first_name: DataTypes.STRING'))
                .pipe(helpers.ensureContent('last_name: DataTypes.STRING'))
                .pipe(helpers.ensureContent('bio: DataTypes.TEXT'))
                .pipe(helpers.ensureContent('reviews: DataTypes.ARRAY(DataTypes.TEXT)'))
                .pipe(helpers.teardown(done));
            });
          });

          it('creates the migration file', done => {
            prepare({
              flags: { name: 'User', attributes }
            }, () => {
              gulp
                .src(Support.resolveSupportPath('tmp', 'migrations'))
                .pipe(helpers.listFiles())
                .pipe(helpers.ensureContent(/\d+-create-user.js/))
                .pipe(helpers.teardown(done));
            });
          });

          [
            { underscored: true, createdAt: 'created_at', updatedAt: 'updated_at'},
            { underscored: false, createdAt: 'createdAt', updatedAt: 'updatedAt'}
          ].forEach(attrUnd => {
            describe((attrUnd.underscored ? '' : 'without ') + '--underscored', () => {
              it('generates the migration content correctly', done => {
                const flags = {
                  name: 'User',
                  attributes
                };

                if ( attrUnd.underscored ) {
                  flags.underscored = attrUnd.underscored;
                }

                prepare({
                  flags
                }, () => {
                  gulp
                    .src(Support.resolveSupportPath('tmp', 'migrations'))
                    .pipe(helpers.readFile('*-create-user.js'))
                    .pipe(helpers.ensureContent('return queryInterface'))
                    .pipe(helpers.ensureContent('.createTable(\'Users\', {'))
                    .pipe(helpers.ensureContent(
                      'first_name: {\n        type: Sequelize.STRING\n      },'
                    ))
                    .pipe(helpers.ensureContent(
                      'last_name: {\n        type: Sequelize.STRING\n      },'
                    ))
                    .pipe(helpers.ensureContent(
                      'bio: {\n        type: Sequelize.TEXT\n      },'
                    ))
                    .pipe(helpers.ensureContent(
                      'reviews: {\n        type: Sequelize.ARRAY(Sequelize.TEXT)\n      },'
                    ))
                    .pipe(helpers.ensureContent([
                      '     id: {',
                      '        allowNull: false,',
                      '        autoIncrement: true,',
                      '        primaryKey: true,',
                      '        type: Sequelize.INTEGER',
                      '      },'
                    ].join('\n')))
                    .pipe(helpers.ensureContent([
                      '     ' + attrUnd.createdAt + ': {',
                      '        allowNull: false,',
                      '        type: Sequelize.DATE',
                      '      },'
                    ].join('\n')))
                    .pipe(helpers.ensureContent([
                      '     ' + attrUnd.updatedAt + ': {',
                      '        allowNull: false,',
                      '        type: Sequelize.DATE',
                      '      }'
                    ].join('\n')))
                    .pipe(helpers.ensureContent('});'))
                    .pipe(helpers.ensureContent('.dropTable(\'Users\')'))
                    .pipe(helpers.teardown(done));
                });
              });

              it('generates the model content correctly', done => {
                const flags = {
                  name: 'User',
                  attributes
                };

                const targetContent = attrUnd.underscored ?
                  'underscored: true'
                  : '{\n    classMethods';

                if ( attrUnd.underscored ) {
                  flags.underscored = attrUnd.underscored;
                }

                prepare({
                  flags
                }, () => {
                  gulp
                    .src(Support.resolveSupportPath('tmp', 'models'))
                    .pipe(helpers.readFile('user.js'))
                    .pipe(helpers.ensureContent(targetContent))
                    .pipe(helpers.teardown(done));
                });
              });
            });
          });

          describe('when called twice', () => {
            beforeEach(function (done) {
              this.flags = { name: 'User', attributes };
              prepare({ flags: this.flags }, done);
            });

            it('exits with an error code', function (done) {
              gulp
                .src(Support.resolveSupportPath('tmp'))
                .pipe(helpers.runCli(combineFlags(this.flags), { exitCode: 1 }))
                .pipe(helpers.teardown(done));
            });

            it('notifies the user about the possibility of --flags', function (done) {
              gulp
                .src(Support.resolveSupportPath('tmp'))
                .pipe(helpers.runCli(combineFlags(this.flags), { pipeStderr: true }))
                .pipe(helpers.teardown((err, stderr) => {
                  expect(stderr).to.contain('already exists');
                  done();
                }));
            });
          });
        });
      });
    });
  });
});
