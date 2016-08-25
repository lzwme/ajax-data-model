/**
 * @file 基本的数据缓存类
 */

/**
 * 内存缓存数据对象类，与 `localStorage` API 保持一致
 */
class DataCache {
    constructor() {
        this.length = 0;
        this.cache = {};
    }
    /**
     * 获取值
     * @param  {String} key
     * @return {*}
     */
    getItem(key) {
        return this.cache[key];
    }
    /**
     * 设置值
     * @param {String} key
     * @param {*} value
     */
    setItem(key, value) {
        this.cache[key] = value;
        this.length++;
    }
    /**
     * 删除一个值
     * @param  {String} key
     * @return {void}
     */
    removeItem(key) {
        if (this.cache.hasOwnProperty(key)) {
            this.length--;
            delete this.cache[key];
        }
    }
    /**
     * 清空
     */
    clear() {
        this.length = 0;
        this.cache = {};
    }
    /**
     * 取得第 index 个数的 key
     * @param  {Number} index
     * @return {*}
     */
    key(index) {
        let key, _index = 0;

        for (key in this.cache) {
            if (index === _index) {
                return key;
            }
            _index++;
        }

        return null;
    }
}

export default DataCache;
