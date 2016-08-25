/**
 * cache helper
 */
import settings from './settings';
import DataCache from './DataCache';

// 缓存数据对象。为了避免混淆，只缓存至一级结构
const dataCache = new DataCache();

/**
 * 修正 cacheName
 * @param  {String} cacheName 原始的值，可能是任意格式
 * @return {String}           修正后的 cacheName，以 cachePrefix 开头
 */
function adjustCacheName(cacheName) {
    if (!cacheName) {
        return '';
    }

    cacheName = encodeURIComponent(('' + cacheName).replace(/\//g, '.').replace(/^\./, '').replace(/(^\s+|\s+$)/g, ''));
    if (cacheName.indexOf(settings.cachePrefix) !== 0) {
        cacheName = settings.cachePrefix + cacheName;
    }

    return cacheName;
}
/**
 * 根据 cacheType 取得 cacheStorage 对象
 * @param  {String} cacheType
 * @return {Object}
 */
export function getCacheStor(cacheType) {
    let cacheStor = dataCache;

    if ('sessionStorage' === cacheType || 'localStorage' === cacheType) {
        cacheStor = window[cacheType] || cacheStor;
    }

    return cacheStor;
}
/**
 * 根据 cacheName 名称层级获取对应 dataCache 中的缓存数据
 * @param  {String} cacheName - 名称，以 . 分割层级，如 ups.pa.query.tags.group
 * @param  {String} cacheType - 缓存类型：sessionStorage、localStorage 、 memory(默认)
 * @return {*}                  返回读取到的数据
 */
export function getCacheDataByName(cacheName, cacheType) {
    let data, cacheStor = getCacheStor(cacheType);

    if (!(cacheName = adjustCacheName(cacheName))) {
        return data;
    }

    try {
        data = JSON.parse(cacheStor.getItem(cacheName));
    } catch (e) {
        data = cacheStor.getItem(cacheName);
    }

    return data || undefined;
}
/**
 * 根据 cacheName 名称尝试移除缓存中存在的数据
 * @param  {String|RegExp}  cacheName - 名称，以 . 分割层级，如 ups.pa.query.tags.group。支持正则匹配
 * @param  {String} cacheType - 缓存类型：sessionStorage、localStorage 、 memory(默认)
 * @return {*}
 */
export function deleteCacheDataByName(cacheName, cacheType) {
    let item,
        cacheStor = getCacheStor(cacheType),
        i,
        len;

    // 为正则，支持模糊删除
    if (cacheName instanceof RegExp) {
        len = cacheStor.length;

        for (i = 0; i < len; i++) {
            item = cacheStor.key(i);

            if (
                !item || // 兼容
                item.indexOf(settings.cachePrefix) !== 0 || // 过滤前缀
                !cacheName.test(item.slice(settings.cachePrefix.length)) // 规则检测
            ) {
                continue;
            }

            // 符合规则，移除
            cacheStor.removeItem(item);
        }

        return;
    }

    // 精确的查找与删除
    if (!(cacheName = adjustCacheName(cacheName))) {
        return;
    }

    cacheStor.removeItem(cacheName);
}
/**
 * 存储数据到本地
 * @param {String} cacheName - 用于存储的名称
 * @param {*}      data - 任意类型的数据
 * @param {String} cacheType - 存储类型，支持三种方式：sessionStorage、localStorage 和内存中(默认)
 */
export function saveTOCache(cacheName, data, cacheType) {
    if (!(cacheName = adjustCacheName(cacheName))) {
        return;
    }

    const cacheStor = getCacheStor(cacheType);

    if (cacheStor === dataCache) {
        // 存到内存 dataCache
        cacheStor.setItem(cacheName, data);
    } else {
        cacheStor.setItem(cacheName, JSON.stringify(data));
    }
}

/**
 * 是否为类字符串
 */
export function isString(text) {
    let type = typeof text;

    if ('string' === type || 'number' === type) {
        return true;
    }
    return false;
}
