module.exports = async (arr, callback) => {
    for (let i = 0; i < arr.length; i++) {
        await callback(arr[i], i, arr);
    }
}