'use strict';

const Bluebird  = require('bluebird');

module.exports = {
  up(db) {
    return Bluebird
      .delay(1000)
      .then(() => {
        return db.sequelize.query('INVALID QUERY');
      });
  }
};
