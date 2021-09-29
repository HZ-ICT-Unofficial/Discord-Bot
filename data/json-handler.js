const fs = require("fs")

const jsonHandler = {
    read: (path) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path, {encoding: 'utf8'}, (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(JSON.parse(data));
            });
        });
    },
    write: (path, data) => {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, JSON.stringify(data), {encoding: 'utf8'}, (err) => {
                if (err){
                    return reject(err);
                }
                return resolve(true);
            })
        })
    }
}


module.exports = jsonHandler;