'use strict';

module.exports = {
  up: function (queryInterface) {
    return queryInterface
      .bulkInsert('<%= tableName %>', [{
        id: "",
        <% _.each(attributes, function (fieldName) { %>
        <%= fieldName %>: "",
        <% }) %>

      }], {
        id: {},
        <% _.each(attributes, function (fieldName) { %>
        <%= fieldName %>: {},
        <% }) %>
      });
  },

  down: function (queryInterface) {
    return queryInterface.dropTable('<%= tableName %>');
  }
};
