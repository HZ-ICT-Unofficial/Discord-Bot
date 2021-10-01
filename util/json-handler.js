const fs = require('fs');

const JSONHandler = {}

const matchingValues = (firstValue, secondValue) => {
    if (typeof firstValue !== typeof secondValue) {
        return false;
    } else if (firstValue === secondValue) {
        return true;
    } else if (typeof firstValue !== 'object') {
        return false;
    }

    if (!Array.isArray(firstValue)) {
        const keys = Object.keys(firstValue);
        let isMatching = true;
        for (let i = 0; i < keys.length; i++) {
            const currentKey = keys[i];
            const valueA = firstValue[currentKey];
            const valueB = secondValue[currentKey];

            if (valueA && valueB && !matchingValues(valueA, valueB)) {
                isMatching = false;
                break;
            }
        }
        return isMatching;
    } else {
        let isMatching = true;
        for (let i = 0; i < firstValue.length; i++) {
            const valueA = firstValue[i];
            const valueB = secondValue[i];
            if (!matchingValues(valueA, valueB)) {
                isMatching = false;
                break;
            }
        }
        return isMatching;
    }
}

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

JSONHandler.filter = async (path, func, fileData) => {
    if (!fileData) {
        fileData = await JSONHandler.read(path);
    }
    
    return fileData.data.filter(func);
}

JSONHandler.find = async (path, targetValue, fileData) => {
    return JSONHandler.filter(path, (existingValue) => matchingValues(existingValue, targetValue), fileData);
}

JSONHandler.findFirst = async (path, targetValue, fileData) => {
    const results = await JSONHandler.find(path, targetValue, fileData);
    if (results) {
        return results[0];
    }
}

JSONHandler.add = async (path, newData, fileData) => {
    if (!fileData) {
        fileData = await JSONHandler.read(path);
    }
    fileData.data.push(newData);
    await JSONHandler.write(path, fileData);
}

JSONHandler.remove = async (path, target, fileData) => {
    if (!fileData) {
        fileData = await JSONHandler.read(path);
    }

    const results = await JSONHandler.find(path, target, fileData);
    if (results) {
        results.forEach((result) => {
            const index = fileData.data.indexOf(result);
            fileData.data.splice(index, 1);
        });
    }
    
    await JSONHandler.write(path, fileData);
}

module.exports = JSONHandler;