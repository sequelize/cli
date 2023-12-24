'use strict';
<%= isTypescriptProject ? `import { QueryInterface, DataTypes } from 'sequelize';` : '' %>

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface<%= isTypescriptProject ? ': QueryInterface' : '' %>, Sequelize<%= isTypescriptProject ? ': typeof DataTypes' : '' %>) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface<%= isTypescriptProject ? ': QueryInterface' : '' %>, Sequelize<%= isTypescriptProject ? ': typeof DataTypes' : '' %>) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
