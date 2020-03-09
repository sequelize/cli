'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    <% associations.forEach(function(association, i) { %>
      <%= i ? '.then(() => {' : null %> 
        return queryInterface.addColumn(
          '<%= association.source %>',
          '<%= association.columnName %>',
          {
            type: Sequelize.INTEGER,
            references: {
              model: '<%= association.target %>',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          }
        )
        <%= i ? '})' : null %>
    <% }) %>;
  },

  down: (queryInterface, Sequelize) => {
    <% associations.forEach(function(association, i) { %>
      <%= i ? '.then(() => {' : null %> 
        return queryInterface.removeColumn(
          '<%= association.source %>',
          '<%= association.columnName %>'
        )
      <%= i ? '})' : null %>
    <% }) %>;
  }
};
