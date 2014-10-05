"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable("<%= tableName %>", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER
        },

        <% _.each(attributes, function (dataType, fieldName) { %>
          <%= fieldName %>: {
            type: DataTypes.<%= dataType.toUpperCase() %>
          },
        <% }) %>

        createdAt: {
          allowNull: false,
          type: DataTypes.DATE
        },

        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE
        }
      })
      .done(done);
  },

  down: function(migration, DataTypes, done) {
    migration
      .dropTable("<%= tableName %>")
      .done(done);
  }
};
