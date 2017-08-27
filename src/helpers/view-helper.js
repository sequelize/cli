const helpers = require(__dirname);
const clc     = require('cli-color');
const _       = require('lodash');

module.exports = {
  teaser () {
    const versions = [
      'Node: ' + helpers.version.getNodeVersion(),
      'CLI: '  + helpers.version.getCliVersion(),
      'ORM: '  + helpers.version.getOrmVersion()
    ];

    if (helpers.version.getDialectName() && helpers.version.getDialectVersion()) {
      versions.push(
        helpers.version.getDialectName() +
        ': ' +
        helpers.version.getDialectVersion()
      );
    }

    this.log();
    this.log(clc.underline('Sequelize [' + versions.join(', ') + ']'));
    this.log();
  },

  log: console.log,
  error: console.error,

  pad (s, smth) {
    let margin = smth;

    if (_.isObject(margin)) {
      margin = Object.keys(margin);
    }

    if (Array.isArray(margin)) {
      margin = Math.max.apply(null, margin.map(o => {
        return o.length;
      }));
    }

    return s + new Array(margin - s.length + 1).join(' ');
  }
};
