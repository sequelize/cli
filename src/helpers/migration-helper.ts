import _ from 'lodash';
import { helpers } from './index';
import { Utils } from 'sequelize';

export const tableUtils = {
  getTableName(modelName: string): string {
    return Utils.pluralize(modelName);
  },

  generateTableCreationFileContent(args: {
    name: string;
    attributes: any;
    underscored: boolean;
  }): string {
    return helpers.template.render('migrations/create-table.js', {
      tableName: this.getTableName(args.name),
      attributes: helpers.model.transformAttributes(args.attributes),
      createdAt: args.underscored ? 'created_at' : 'createdAt',
      updatedAt: args.underscored ? 'updated_at' : 'updatedAt',
    });
  },

  generateMigrationName(args: any): string {
    return _.trimStart(_.kebabCase('create-' + args.name), '-');
  },

  generateTableCreationFile(args: any) {
    const migrationName = this.generateMigrationName(args);
    const migrationPath = helpers.path.getMigrationPath(migrationName);

    helpers.asset.write(
      migrationPath,
      this.generateTableCreationFileContent(args)
    );
  },
};
