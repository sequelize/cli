'use strict';

module.exports = {
   /**
   * @param { import('sequelize/lib/query-interface')} sqlQueryInterface
   * @param { import('sequelize') } Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

   /**
   * @param { import('sequelize/lib/query-interface')} sqlQueryInterface
   * @param { import('sequelize') } Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
