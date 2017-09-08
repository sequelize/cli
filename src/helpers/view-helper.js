import clc from 'cli-color';
import _ from 'lodash';
import helpers from './index';

module.exports = {
  teaser () {
    const versions = [
      'Node: ' + helpers.version.getNodeVersion(),
      'CLI: '  + helpers.version.getCliVersion(),
      'ORM: '  + helpers.version.getOrmVersion()
    ];

    this.log();
    this.log(clc.underline('Sequelize CLI [' + versions.join(', ') + ']'));
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
