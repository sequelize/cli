'use strict';

const { DataTypes, Model } = require('sequelize');

module.exports = sequelize => {
  class <%= name %> extends Model {
    static associate (models) {
      // associations can be defined here
    }
  }

  return <%= name %>.init({
    <% attributes.forEach(function(attribute, index) { %>
      <%= attribute.fieldName %>: DataTypes.<%= attribute.dataFunction ? `${attribute.dataFunction.toUpperCase()}(DataTypes.${attribute.dataType.toUpperCase()})` : attribute.dataValues ? `${attribute.dataType.toUpperCase()}(${attribute.dataValues})` : attribute.dataType.toUpperCase() %>
      <%= (Object.keys(attributes).length - 1) > index ? ',' : '' %>
    <% }) %>
  }, {
    sequelize,
    <%= underscored ? 'underscored: true,' : '' %>
  });
};
