'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
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
      },

      <% if (paranoid) { %>
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      <% } %>
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('<%= tableName %>');
  }
};
