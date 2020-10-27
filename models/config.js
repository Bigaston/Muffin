
module.exports = {
    "development": {
      "dialect": "sqlite",
      "storage": "./base.db",
      "logging": false
    },
    "test": {
      "username": "root",
      "password": null,
      "database": "database_test",
      "host": "127.0.0.1",
      "dialect": "mysql",
      "operatorsAliases": false
    },
    "production": {
      "username": process.env.BDD_USERNAME,
      "password": process.env.BDD_PASS,
      "database": process.env.BDD_NAME,
      "host": "127.0.0.1",
      "dialect": "mariadb",
      "logging": false,
      "timezone": "Etc/GMT0"
    }
};