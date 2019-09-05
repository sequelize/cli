'use strict';
const path = require('path');
const fs = require('fs');

const readSql = (scripts) => Objct.keys(scripts).reduce((migrations, action) => {
    return {
      ...migrations,
      [action]: ({sequelize}, Sequelize) => {
        return sequelize.query(scripts[action], { type: sequelize.QueryTypes.SELECT})
      }
    }
  }, {});
;

const readFile = (dirname, migrationName) => 
    (action) => fs.readFileSync(
        path.resolve(dirname, migrationName.replace(/\.[^/.]+$/, `.${action}.sql`)),
        'utf8',
    );

const runQuey = function(filename, dirname) {
    const migrationName = path.basename(filename);
    const read = readFile(dirname, migrationName);
    return {
        up: read('up'),
        down: read('down')
    };
};
module.exports = (filename, dirname) => runQuey(
    readSql(filename, dirname)
);
