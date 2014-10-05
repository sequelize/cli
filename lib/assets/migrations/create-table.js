"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration
      .createTable("<%= tableName %>", {
        id: {
          dataType: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },

        <% _.each(attributes, function (dataType, fieldName) { %>
          <%= fieldName %>: {
            dataType: DataTypes.<%= dataType.toUpperCase() %>
          },
        <% }) %>

        createdAt: {
          dataType: DataTypes.DATE,
          allowNull: false
        },

        updatedAt: {
          dataType: DataTypes.DATE,
          allowNull: false
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
