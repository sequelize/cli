'use strict';

var Bluebird  = require('bluebird');

module.exports = {
  up: function (db) {
    return Bluebird
      .delay(1000)
      .then(function () {
        return db.bulkInsert('Person', [{ name: 'John Doe' }], { name: {} });
      })
      .then(function () {
        return db.insert('Task', [{ title: 'Find own identity' }], { name: {} });
      });
  }
};
