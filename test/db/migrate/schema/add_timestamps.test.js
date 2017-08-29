

const expect    = require('expect.js');
const Support   = require(__dirname + '/../../../support');
const helpers   = require(__dirname + '/../../../support/helpers');
const gulp      = require('gulp');

[
  'db:migrate:schema:timestamps:add'
].forEach(flag => {
  const prepare = function (config, callback) {
    config = helpers.getTestConfig(config);

    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration('createPerson.js'))
      .pipe(helpers.copyMigration('renamePersonToUser.js'))
      .pipe(helpers.overwriteFile(JSON.stringify(config), 'config/config.json'))
      .pipe(helpers.runCli('db:migrate'))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag), () => {
    beforeEach(function (done) {
      prepare.call(this, null, () => {
        return gulp
          .src(Support.resolveSupportPath('tmp'))
          .pipe(helpers.runCli(flag))
          .pipe(helpers.teardown(done));
      });
    });

    it('renames the original table', function (done) {
      const self = this;

      helpers.readTables(self.sequelize, tables => {
        expect(tables).to.have.length(3);
        expect(tables.indexOf('SequelizeMeta')).to.be.above(-1);
        expect(tables.indexOf('SequelizeMetaBackup')).to.be.above(-1);
        done();
      });
    });

    it('keeps the data in the original table', function (done) {
      helpers.execQuery(
        this.sequelize,
        this.sequelize.getQueryInterface().QueryGenerator.selectQuery('SequelizeMetaBackup'),
        { raw: true }
      ).then(items => {
        expect(items.length).to.equal(2);
        done();
      });
    });

    it('keeps the structure of the original table', function (done) {
      const self = this;

      helpers.readTables(self.sequelize, () => {
        return self
          .sequelize
          .getQueryInterface()
          .describeTable('SequelizeMetaBackup')
          .then(fields => {
            expect(Object.keys(fields).sort()).to.eql(['name']);
            done();
            return null;
          });
      });
    });

    it('creates a new SequelizeMeta table with the new structure', function (done) {
      this.sequelize.getQueryInterface().describeTable('SequelizeMeta').then(fields => {
        expect(Object.keys(fields).sort()).to.eql(['createdAt', 'name', 'updatedAt']);
        done();
      });
    });

    it('copies the entries into the new table', function (done) {
      helpers.execQuery(
        this.sequelize,
        this.sequelize.getQueryInterface().QueryGenerator.selectQuery('SequelizeMeta'),
        { raw: true, type: 'SELECT' }
      ).then(items => {
        expect(items[0].name).to.eql('20111117063700-createPerson.js');
        expect(items[1].name).to.eql('20111205064000-renamePersonToUser.js');
        done();
      });
    });

    it('is possible to undo one of the already executed migrations', function (done) {
      const self = this;

      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.runCli('db:migrate:undo'))
        .pipe(helpers.teardown(() => {
          helpers.execQuery(
            self.sequelize,
            self.sequelize.getQueryInterface().QueryGenerator.selectQuery('SequelizeMeta'),
            { raw: true, type: 'SELECT' }
          ).then(items => {
            expect(items[0].name).to.eql('20111117063700-createPerson.js');
            done();
          });
        }));
    });
  });
});
