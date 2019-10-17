'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Sequelize = _index2.default.generic.getSequelize();

module.exports = {
  getTableName(modelName) {
    return Sequelize.Utils.pluralize(modelName);
  },

  generateTableCreationFileContent(args) {
    return _index2.default.template.render('migrations/create-table.js', {
      tableName: this.getTableName(args.name),
      attributes: _index2.default.model.transformAttributes(args.attributes),
      createdAt: args.underscored ? 'created_at' : 'createdAt',
      updatedAt: args.underscored ? 'updated_at' : 'updatedAt'
    });
  },

  generateMigrationName(args) {
    return _lodash2.default.trimStart(_lodash2.default.kebabCase('create-' + args.name), '-');
  },

  generateTableCreationFile(args) {
    const migrationName = this.generateMigrationName(args);
    const migrationPath = _index2.default.path.getMigrationPath(migrationName);

    _index2.default.asset.write(migrationPath, this.generateTableCreationFileContent(args));
  }
};