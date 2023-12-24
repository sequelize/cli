'use strict';
<%= isTypescriptProject ? `import { QueryInterface, DataTypes } from 'sequelize';` : '' %>

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface<%= isTypescriptProject ? ': QueryInterface' : '' %>, Sequelize<%= isTypescriptProject ? ': typeof DataTypes' : '' %>) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down (queryInterface<%= isTypescriptProject ? ': QueryInterface' : '' %>, Sequelize<%= isTypescriptProject ? ': typeof DataTypes' : '' %>) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
