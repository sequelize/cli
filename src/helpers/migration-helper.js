import _ from 'lodash';
import helpers from './index';

const Sequelize = helpers.generic.getSequelize();

module.exports = {
  getTableName (modelName) {
    return Sequelize.Utils.pluralize(modelName);
  },

  generateTableCreationFileContent (args) {
    return helpers.template.render('migrations/create-table.js', {
      tableName:  this.getTableName(args.name),
      attributes: helpers.model.transformAttributes(args.attributes),
      createdAt:  args.underscored ? 'created_at' : 'createdAt',
      updatedAt:  args.underscored ? 'updated_at' : 'updatedAt'
    });
  },

  generateAssociationCreationFileContent(associations) {
    return helpers.template.render('migrations/add-relation-to-table.js', {
      associations
    });
  },

  generateJoinTableFileContent(association) {
    return helpers.template.render('migrations/create-join-table.js', {
      tableName: association.through,
      source: association.source,
      target: association.target
    });
  },

  generateMigrationName (args) {
    return _.trimStart(_.kebabCase('create-' + args.name), '-');
  },

  generateAssociationName (args) {
    return _.trimStart(_.kebabCase('-add-relation-to' + args.name), '-');
  },

  generateTableCreationFile (args) {
    const migrationName = this.generateMigrationName(args);
    const migrationPath = helpers.path.getMigrationPath(migrationName);

    helpers.asset.write(migrationPath, this.generateTableCreationFileContent(args));
  },

  generateAssociationCreationFile (args) {
    if (args.associations) {
      const [others, belongsToMany] = helpers.model.transformAssociations(args);
      const migrationName = this.generateAssociationName(args);
      const migrationPath = helpers.path.getMigrationPath(migrationName);

      if (belongsToMany.length) {
        const joinTableName = this.generateMigrationName(belongsToMany[0]);
        const joinTablePath = helpers.path.getMigrationPath(joinTableName);
        helpers.asset.write(joinTablePath, this.generateJoinTableFileContent(belongsToMany[0]));
      }

      helpers.asset.write(migrationPath, this.generateAssociationCreationFileContent(others));
    }
  }
};
