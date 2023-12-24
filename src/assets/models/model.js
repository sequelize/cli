'use strict';

import { Model, DataTypes } from 'sequelize';
const sequelize = require('./connection'); 

<% if (isTypescriptProject) { %>
export interface <%= name %>Attributes {
  <% attributes.forEach(function(attribute, index) { %>
    <%= attribute.fieldName %>: <%= attribute.tsType %>;
  <% }) %>
}
<% } %>

class <%= name %> extends Model<%= isTypescriptProject ? '<UserAttributes> implements UserAttributes' : '' %> {
<% if (isTypescriptProject) { %>
  <% attributes.forEach(function(attribute, index) { %>
    <%= attribute.fieldName %><%=isTypescriptProject ? `!: ${attribute.tsType}` : '' %>;
  <% }) %>
<% } %>
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

// Associations
// <%= name %>.belongsTo(TargetModel, {
//   as: 'custom_name',
//   foreignKey: {
//     name: 'foreign_key_column_name',
//     allowNull: false,
//   },
//   onDelete: "RESTRICT",
//   foreignKeyConstraint: true,
// });

export default  <%= name %>;
