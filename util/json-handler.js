const fs = require('fs');

const JSONHandler = {}

const areSimilarArrays = (arrayA, arrayB) => {
    if (firstValue.length !== secondValue.length) {
        return false;
    }
    for (let i = 0; i < arrayA.length; i++) {
        if (!areSimilarValues(arrayA[i], arrayB[i])) {
            return false;
        }
    }
    return true;
}

const areSimilarObjects = (objectA, objectB) => {
    const keys = Object.keys(objectA);
    for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        const valueA = objectA[currentKey];
        const valueB = objectB[currentKey];
        if (valueA && valueB && !areSimilarValues(valueA, valueB)) {
            return false;
        }
    }
    return true;
}

const areSimilarValues = (firstValue, secondValue) => {
    if (typeof firstValue !== typeof secondValue) {
        return false;
    } else if (firstValue === secondValue) {
        return true;
    } else if (typeof firstValue === 'function') {
        throw new Error('Functions are not supported');
    }
    if (!Array.isArray(firstValue)) {
        return areSimilarObjects(firstValue, secondValue);
    }
    return areSimilarArrays(firstValue, secondValue);
}

const areEqual = (firstValue, secondValue) => {
    if (typeof firstValue !== typeof secondValue) {
        return false;
    } else if (firstValue === secondValue) {
        return true;
    } else if (typeof firstValue === 'function') {
        throw new Error('Functions are not supported');
    }
    return JSON.stringify(firstValue) === JSON.stringify(secondValue);
}

JSONHandler.open = (path) => {
    return new Promise((resolve, reject) => {
        // fs.open()
    });
}

JSONHandler.read = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, {encoding: 'utf8'}, (err, data) => {
            if (err) {
                return reject(err);
            }
            if (data) {
                return resolve(JSON.parse(data));
            }
            return resolve(false)
            
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

JSONHandler.query = async (path, targetValue, fileData) => {
    return JSONHandler.filter(path, (existingValue) => areSimilarValues(existingValue, targetValue), fileData);
}

JSONHandler.find = async (path, targetValue, fileData) => {
    return JSONHandler.filter(path, (existingValue) => areEqual(existingValue, targetValue), fileData);
}

JSONHandler.add = async (path, newData, fileData) => {
    if (!fileData) {
        fileData = await JSONHandler.read(path);
    }
    fileData.data.push(newData);
    await JSONHandler.write(path, fileData);
}

JSONHandler.addUnique = async (path, newData, fileData) => {
    const results = await JSONHandler.find(path, newData, fileData);
    if (results.length > 0) {
        return false;
    }
    await JSONHandler.add(path, newData, fileData);
    return true;
}

JSONHandler.remove = async (path, target, fileData) => {
    if (!fileData) {
        fileData = await JSONHandler.read(path);
    }

    const results = await JSONHandler.query(path, target, fileData);
    if (results.length > 0) {
        results.forEach((result) => {
            const index = fileData.data.indexOf(result);
            fileData.data.splice(index, 1);
        });
        await JSONHandler.write(path, fileData);
    }
    return results;
}

JSONHandler.createDirectory = async (location, name) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(`${location}/${name}`, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        })
    });
}

module.exports = JSONHandler;