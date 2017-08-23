'use strict';

module.exports = function(sequelize, DataTypes) {
  var <%= name %> = sequelize.define('<%= name %>', {
    <% Object.keys(attributes).forEach(function(fieldName, index) { %>
      <%= fieldName %>: DataTypes.<%= attributes[fieldName].toUpperCase() %>
      <%= (Object.keys(attributes).length - 1) > index ? ',' : '' %>
    <% }) %>
  }, {
    <%= underscored ? 'underscored: true,' : '' %>
  });

  <%= name %>.associate = function(models) {
    // associations can be defined here
  };

  return <%= name %>;
};
