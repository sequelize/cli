import _ from 'lodash';
import helpers from './index';

const Sequelize = helpers.generic.getSequelize();

module.exports = {
  getTableName(modelName) {
    return Sequelize.Utils.pluralize(modelName);
  },

  generateTableCreationFileContent(args) {
    const templateOptions = {
      tableName: this.getTableName(args.name),
      attributes: helpers.model.transformAttributes(args.attributes)
    };


    //If timestamps argument is not false or is not set then add timestamps 
    if (args.timestamps !== false) {
      templateOptions.createdAt = args.underscored ? 'created_at' : 'createdAt';
      templateOptions.updatedAt = args.underscored ? 'updated_at' : 'updatedAt';
    }
    return helpers.template.render('migrations/create-table.js', templateOptions);
  },

  generateMigrationName(args) {
    return _.trimStart(_.kebabCase('create-' + args.name), '-');
  },

  generateTableCreationFile(args) {
    const migrationName = this.generateMigrationName(args);
    const migrationPath = helpers.path.getMigrationPath(migrationName);

    helpers.asset.write(migrationPath, this.generateTableCreationFileContent(args));
  }
};
