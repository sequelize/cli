'use strict';

const Bluebird = require('bluebird');

module.exports = {
  up: async (queryInterface) => {
    await Bluebird.delay(1);
    await queryInterface.sequelize.query('INVALID QUERY');
  },
};
