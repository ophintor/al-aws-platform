'use strict'

module.exports = function TodoApp(connection) {
    return {
        list: (callback) => {
            connection.query('SELECT * FROM todo', (error, results, fields) => {
                if (error) {
                    callback(error);
                    return
                }

                callback(null, results);
            });
        },
        add: (post, callback) => {
            connection.query('INSERT INTO todo SET ?', post, (error, results, fields) => {
                if (error) {
                    callback(error);
                    return
                }

                callback(null, null);
            });
        },
        delete: (post, callback) => {
            connection.query('DELETE FROM todo WHERE ?', post, (error, results, fields) => {
                if (error) {
                    callback(error);
                    return
                }

                callback(null, null);
            });
        },
    };
}
