import helpers from './index';

const Sequelize = helpers.generic.getSequelize();
import Umzug from 'umzug';
import Bluebird from 'bluebird';
import _ from 'lodash';

function logMigrator (s) {
  if (s.indexOf('Executing') !== 0) {
    helpers.view.log(s);
  }
}

function getSequelizeInstance() {
  let config = null;

  try {
    config = helpers.config.readConfig();
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }

  config = _.defaults(config, { logging: logMigrator });

  try {
    return new Sequelize(config);
  } catch (e) {
    console.warn(e);
    throw e;
  }
}

export function getMigrator(type, args) {
  if (!(helpers.config.configFileExists() || args.url)) {
    console.log(
      'Cannot find "' + helpers.config.getConfigFile() +
      '". Have you run "sequelize init"?'
    );
    process.exit(1);
  }

  const sequelize = getSequelizeInstance();
  const migrator = new Umzug({
    storage: helpers.umzug.getStorage(type),
    storageOptions: helpers.umzug.getStorageOptions(type, { sequelize }),
    logging: console.log,
    migrations: {
      params: [sequelize.getQueryInterface(), Sequelize],
      path: helpers.path.getPath(type),
      pattern: helpers.config.supportsCoffee() ? /\.js$|\.coffee$/ : /\.js$/,
      wrap: fun => {
        if (fun.length === 3) {
          return Bluebird.promisify(fun);
        } else {
          return fun;
        }
      }
    }
  });

  return sequelize
    .authenticate()
    .then(() => migrator)
    .catch(err => {
      console.error('Unable to connect to database: ' + err);
      process.exit(1);
    });
}