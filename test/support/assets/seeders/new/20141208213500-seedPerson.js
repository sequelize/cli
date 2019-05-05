'use strict';

const Bluebird  = require('bluebird');

module.exports = {
  up(db) {
    return Bluebird
      .delay(1000)
      .then(() => {
        return db.bulkInsert('Person', [{ name: 'John Doe' }], { name: {} });
      })
      .then(() => {
        return db.insert('Task', [{ title: 'Find own identity' }], { name: {} });
      });
  }
};
