'use strict';
<%= isTypescriptProject ? `import { QueryInterface, DataTypes } from 'sequelize';` : '' %>

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface<%= isTypescriptProject ? ': QueryInterface' : '' %>, Sequelize<%= isTypescriptProject ? ': typeof DataTypes' : '' %>) {
    await queryInterface.createTable('<%= tableName %>', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      <% attributes.forEach(function(attribute) { %>
        <%= attribute.fieldName %>: {
          type: Sequelize.<%= attribute.dataFunction ? `${attribute.dataFunction.toUpperCase()}(Sequelize.${attribute.dataType.toUpperCase()})` : attribute.dataValues ? `${attribute.dataType.toUpperCase()}(${attribute.dataValues})` : attribute.dataType.toUpperCase() %>
        },
      <% }) %>

      <%= createdAt %>: {
        allowNull: false,
        type: Sequelize.DATE
      },

      <%= updatedAt %>: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface<%= isTypescriptProject ? ': QueryInterface' : '' %>, Sequelize<%= isTypescriptProject ? ': typeof DataTypes' : '' %>) {
    await queryInterface.dropTable('<%= tableName %>');
  }
};
