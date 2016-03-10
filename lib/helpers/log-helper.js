'use strict';

var _ = require('lodash');

module.exports = {
  parse: function (buffer) {
    var lines  = buffer.toString().split('\n');
    var result = lines.map(mapLine);

    return _.compact(result).join('\n');
  }
};

function mapLine (line) {
  return filters().reduce(function (filteredLine, filter) {
    if (!!filteredLine) {
      return filter(filteredLine);
    }
  }, line);
}

function filters () {
  return [
    function filterTimestamps (l) {
      if (!l.match(/\[\d{2}:\d{2}:\d{2}\]/)) {
        return l;
      }
    },

    function filterGulpfile (l) {
      if (!l.match(/^Using\sgulpfile/) && !l.match(/^Starting|Finished\s/)) {
        return l;
      }
    },

    function parseProgramName (l) {
      if (!l.match(/gulp \[TASK\]/)) {
        return l;
      } else {
        return l.replace('gulp [TASK]', 'sequelize [task]');
      }
    }
  ];
}
