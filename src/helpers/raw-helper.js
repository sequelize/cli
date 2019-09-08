'use strict';
import helpers from './index';
import path from'path';
import fs from 'fs';
import clc from 'cli-color';

const writeSql = (actionName, dirname) => {
    const name = getActionName(actionName);
    const files = filesToCreate(name);
    return writeFiles(dirname, files) 
};

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

const template = `
    const { run } = require('sequelize-cli');
    module.exports = run(__filename, __dirname);
`;

const writeFiles = (dirname, files) => Object.keys(files)
    .forEach(
        filename => {
            const fullpath = path.resolve(dirname, filename);
            return (
                fs.writeFileSync(fullpath, files[filename]),
                helpers.view.log(
                    'File created at',
                    clc.blueBright(fullpath),
                    '.'
                ))
            }
    );

const runnerRaw = (filename, dirname) => pipe(
    readSqlFiles,
    buildMigrations,
)([filename, dirname]);

const pipe = (...functions) => args => functions.reduce((arg, fn) => fn(arg), args);

const readSqlFiles = function ([filename, dirname]) {
    var migrationName = path.basename(filename);
    var read = readFile(dirname, migrationName);
    return {
        up: read('up'),
        down: read('down')
    };
};

const readFile = (dirname, migrationName) => 
    (action) => fs.readFileSync(
        path.resolve(dirname, migrationName.replace(/\.[^/.]+$/, `.${action}.sql`)),
        'utf8',
    );

const buildMigrations = (scripts) => Object.keys(scripts).reduce(
    (migrations, action) => Object.assign(migrations, {
        [action]: ({ sequelize }) => sequelize.query(scripts[action])
    }),
    {},
)

module.exports = {
    write: writeSql,
    run: runnerRaw,
};
