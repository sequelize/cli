'use strict';
const path = require('path');
const fs = require('fs');

const template = `
    const runner = require('migration-cli');
    module.exports = runner(__filename, __dirname);
`;

const getActionName = (actionName) => {
    const datetime = (new Date()).toJSON().replace(/[^0-9]/g, '');
    return `${datetime}-${actionName}`;
};

const filesToCreate = (name) => {
    return {
        [`${name}.down.sql`]: '',
        [`${name}.up.sql`]: '',
        [`${name}.js`]: template,
    }   
}
const writeFiles = (writeFileSync, resolve) => (dirname, files) => Object.keys(files)
    .forEach(
        filename => (
            writeFileSync(resolve(dirname, filename), files[filename]),
            console.log('\x1b[36m', `created ${filename}`,'\x1b[0m')),
    );

const writeSql = (writeFileSync, resolve) => (actionName, dirname) => {
    const name = getActionName(actionName);
    const files = filesToCreate(name);
    return writeFiles(writeFileSync, resolve)(dirname, files) 
};


const readFile = (dirname, migrationName) => 
    (action) => fs.readFileSync(
        path.resolve(dirname, migrationName.replace(/\.[^/.]+$/, `.${action}.sql`)),
        'utf8',
    );

const readSqlFiles = function (filename, dirname) {
    var migrationName = path.basename(filename);
    var read = readFile(dirname, migrationName);
    return {
        up: read('up'),
        down: read('down')
    };
};

const buildMigrations = (scripts) => Object.keys(scripts).reduce(
    (migrations, action) => Object.assign(migrations, {
        [action]: ({ sequelize }, Sequelize) => sequelize
            .query(scripts[action])
    }),
    {},
)

const runnerRaw = (filename, dirname) =>
    buildMigrations(
        readSqlFiles(filename, dirname)
    );

module.exports = {
    read: readSqlFiles,
    write: writeSql,
    run: runnerRaw,
};
