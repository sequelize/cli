'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class <%= name %> extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }

  <%= name %>.init({
    <% attributes.forEach(function(attribute, index) { %>
      <%= attribute.fieldName %>: DataTypes.<%= attribute.dataFunction ? `${attribute.dataFunction.toUpperCase()}(DataTypes.${attribute.dataType.toUpperCase()})` : attribute.dataValues ? `${attribute.dataType.toUpperCase()}(${attribute.dataValues})` : attribute.dataType.toUpperCase() %>
      <%= (Object.keys(attributes).length - 1) > index ? ',' : '' %>
    <% }) %>
  }, {
    sequelize,
    modelName: '<%= name %>',
    <%= underscored ? 'underscored: true,' : '' %>
  });

  return <%= name %>;
};
