'use strict';
/** 
 * @typedef  { import("sequelize").DataTypes } DataTypes
 * @typedef  { import("sequelize").Sequelize } Sequelize
 * */
module.exports = {
	/**
	*  Typed intellesence
	* @param {QueryInterface} queryInterface 
	* @param {DataTypes} DataTypes 
	*/
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },
	/**
	*  Typed intellesence
	* @param {QueryInterface} queryInterface 
	* @param {DataTypes} DataTypes 
	*/
  async down (queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
