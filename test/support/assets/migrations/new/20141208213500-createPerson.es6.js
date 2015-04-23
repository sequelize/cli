import Bluebird from 'bluebird';
import Sequelize from 'sequelize';

export default {

  up(db) {
    return Bluebird
      .delay(1000)
      .then(() => {
        return db.createTable('Person', {
          name: Sequelize.STRING
        });
      })
      .then(() => {
        return db.createTable('Task', {
          title: Sequelize.STRING
        });
      });
  }

};
