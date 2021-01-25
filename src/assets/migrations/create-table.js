'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
        defaultValue: Sequelize.fn('now'),
      },

      <%= updatedAt %>: {
        allowNull: false,
        type: Sequelize.DATE
        defaultValue: Sequelize.fn('now'),
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('<%= tableName %>');
  }
};
