'use strict';

const { DataTypes, Model } = require('sequelize');

class <%= name %> extends Model {
  static setup (sequelize) {
    this.init({
      <% attributes.forEach(function(attribute, index) { %>
        <%= attribute.fieldName %>: DataTypes.<%= attribute.dataFunction ? `${attribute.dataFunction.toUpperCase()}(DataTypes.${attribute.dataType.toUpperCase()})` : attribute.dataValues ? `${attribute.dataType.toUpperCase()}(${attribute.dataValues})` : attribute.dataType.toUpperCase() %>
        <%= (Object.keys(attributes).length - 1) > index ? ',' : '' %>
      <% }) %>
    }, {
      sequelize,
      modelName: '<%= name %>',
      <%= underscored ? 'underscored: true,' : '' %>
    });
  }

  static associate (models) {
    // associations can be defined here
  }
}

module.exports = <%= name %>;
