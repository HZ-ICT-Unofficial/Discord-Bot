const fs = require('fs');

const JSONHandler = {}

JSONHandler.read = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, {encoding: 'utf8'}, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(JSON.parse(data));
        });
    });
}

JSONHandler.write = (path, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, JSON.stringify(data), {encoding: 'utf8'}, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        })
    });
}

JSONHandler.find = async (path, func, fileData) => {
    if (!fileData) {
        fileData = await JSONHandler.read(path);
    }
    
    return fileData.data.filter(func);
}

JSONHandler.findFirst = async (path, func, fileData) => {
    const results = await JSONHandler.find(path, func);
    if (results) {
        return results[0];
    }
}

JSONHandler.remove = async (path, func, fileData) => {
    if (!fileData) {
        fileData = await JSONHandler.read(path);
    }

    const results = await JSONHandler.find(path, func, fileData);
    if (results) {
        results.forEach((result) => {
            const index = fileData.data.indexOf(result);
            fileData.data.splice(index, 1);
        });
    }
    
    await JSONHandler.write(path, fileData);
}

module.exports = JSONHandler;