import { _baseOptions } from '../helpers/yargs';

exports.builder = yargs => _baseOptions(yargs).help().argv;
exports.handler = function () {};
