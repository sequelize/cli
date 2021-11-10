'use strict';
/** 
 * @typedef  { import("sequelize").DataTypes } DataTypes
 * @typedef  { import("sequelize").QueryInterface } QueryInterface
 * */
module.exports = {
  /**
	*  Typed intellesence
	* @param {QueryInterface} queryInterface 
	* @param {DataTypes} DataTypes 
	*/
  async up (queryInterface, DataTypes) {
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
	/**
	*  Typed intellesence
	* @param {QueryInterface} queryInterface 
	* @param {DataTypes} DataTypes 
	*/
  async down (queryInterface, DataTypes) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
