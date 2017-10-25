/**
 * @file 全局数据模型 model
 * 提供数据的读取、保存/缓存、删除、更新等操作。各模块 model 可继承该模型，以进行模块范围内的数据存取操作。
 * @module adm
 * @author lzwy0820@qq.com
 * @since 2016-03-31
 *
 * @example
 * import adm from 'ajax-data-model';
 * const upsModel = $.extend(true, {}, adm, {aa: 'ccc', restapi: {task_type: '/rest/task/type'}});
 * // 支持的方法：upsModel.get、upsModel.save、upsModel.delete、upsModel.clear
 * // 配置了 url，则都返回 Promise 对象，不管是否缓存
 * upsModel.get({url: '/rest/xxx'}).done().fail().then();
 * // 保存数据到 localStorage 中
 * upsModel.save('appList', [{music: 'test'}], 'localStorage');
 * // 通过名字获取，返回存储的数据或者 undefined
 * upsModel.get('appList');
 * upsModel.get('appList', 'localStorage');
 *
 * @example
 * // 获取 task_type 数据
 * const data = {type: 10};
 * adm.get({
 *     url: upsModel.restapi.task_type,
 *     data: data,
 *     cache: 'sessionStorage',             // 缓存到 sessionStorage
 *     fromCache: 'sessionStorage',         // 获取时优先从 sessionStorage 读取
 *     cacheName: 'task_type_' + data.type, // 缓存、从缓存读取时使用的名称
 *     expires: 1000 * 60 * 5,              // 数据有效时间为 5 分钟
 * }).then((result) => {
 *     let taskTypeList = result.value || [];
 *     console.log(taskTypeList);
 * }, (err) {
 *     console.log(err);
 * });
 */
'use strict';

// import $ from 'jquery';

import settings from './common/settings';
import {
    getCacheStor,
    deleteCacheDataByName,
    getCacheDataByName,
    saveTOCache,
    isString,
    getPromise
} from './common/cache-helper';

// 常量定义
const WIN = window;
const logTrace = WIN.console.trace;
const ERRURLMSG = '配置了 URL 参数，但值为空或类型不对';

/**
 * ajax 请求通用方法
 * @param {Object}   config - 请求参数配置
 * @param {String}   config.url - ajax url，必须存在，`config.ajaxParam` 中配置此参数无效
 * @param {Object}   config.ajaxParam - ajax 额外参数扩展，如涉及文件上传等
 * @param {Object}   config.data - ajax 请求的参数
 * @param {Object}   config.waiting - 用于传递给 settings.fnWaiting 方法使用的参数配置
 * @param {Object}   config.tipConfig[true] - ajax 出错时的提示配置。配置为 false 时，禁用全局的系统提示，包括 成功/出错/404/50x 等
 * @param {Object}   config.errAlert[true] - ajax error 时是否给出提示
 * @param {Function} callback - ajax 请求成功时回调
 * @param {Function} errCallback - ajax 请求失败或 code !== 200 时回调
 * @param {Object}   param - 传递给 ajax 请求的额外参数
 * @param {Function} fnCB - 请求到数据之后的立即回调方法，用于请求成功后需要前置处理的情况
 * @return {Promise}  用于自定义回调处理。
 *                    注意：ajax 请求的 done/fail 回调，与 callback/errCallback 可能有区别，具体取决于 fnAjaxDone 与 fnAjaxFail 回调的实现
 */
function requestAjax(config, callback, errCallback, fnCB) {
    const $p = getPromise(settings.isJquery);

    if (!config.url || typeof config.url !== 'string') {
        logTrace(ERRURLMSG, config.url);
        return $p.reject(ERRURLMSG, config.url);
    }

    // data.btnWaiting 的兼容，应使用 config.waiting 参数
    if (config.data && config.data.btnWaiting) {
        config.waiting = config.waiting || config.data.btnWaiting;
        delete config.data.btnWaiting;
    }

    // jsonp 兼容
    let dataType = 'json';

    if (/^https?:\/\//.test(config.url) && config.url.search(WIN.location.host) === -1) {
        dataType = 'jsonp';
    }

    // 请求前回调，可以引用方式修改 config
    if (settings.fnBeforeAjax) {
        settings.fnBeforeAjax(config);
    }

    // 格式化 config.data
    let item;

    if ('object' === typeof config.data) {
        for (item in config.data) {
            if ('string' !== typeof config.data[item]) {
                config.data[item] = JSON.stringify(config.data[item]);
            }
        }
    }

    // ajax 请求前处理，与请求后处理呼应
    settings.fnWaiting(config);

    const startTime = new Date();

    return $.ajax($.extend(true, {
        type: 'GET',
        dataType
    }, config.ajaxParam, {
        url: config.url,
        data: config.data
    })).then((result) => {
        const success = settings.fnAjaxDone(result, (res) => {
            if (fnCB instanceof Function) {
                fnCB(result);
            }

            if (callback instanceof Function) {
                callback(res);
            }
        }, errCallback, config);

        // 为 false，设为失败回调
        if (!success) {
            return $p.reject(result);
        }

        // 为 true
        if (true === success) {
            return $p.resolve(result);
        }

        // 为 Promise 风格回调
        if ('function' === typeof success.then) {
            // $p = success;
            // return $p;
            return success;
        }

        // 为其它类型，返回 success 内容
        return $p.resolve(success);
    }, (err) => {
        settings.fnAjaxFail(err, config);

        if (errCallback instanceof Function) {
            errCallback(err);
        }

        return $p.reject(err);
    }).always(() => {
        // ajax 完成后处理
        settings.fnWaiting(config, new Date() - startTime);
    });

    // return $p;
}

// 获取缓存数据的名称 key
function getCacheName(config) {
    // 第一个参数为字符串，则为名称，直接返回 config 作为缓存名称
    if (isString(config) || !config) {
        return config;
    }

    let cacheName = config.cacheName;
    let dataStr;
    const md5 = WIN.$ && WIN.$.md5 || WIN.md5;
    const data = config.data;

    if (!cacheName) {
        cacheName = config.url;

        if (cacheName && typeof data === 'object') {
            let strData = JSON.stringify(data);

            if (typeof md5 === 'function') {
                strData = md5(strData);
            }

            cacheName += dataStr;
        }
    }

    return cacheName;
}

// obj 对象中是否包含键为 key 的项
function hasOwnProperty(obj, key) {
    return obj.hasOwnProperty(key);
}

/**
 * 全局数据模型 model
 * @alias module:adm
 * @type {Object}
 */
export default {
    /**
     * 数据获取，可为远程url、缓存等
     * @param {Object} config 为字符串时，从缓存中读取数据，否则为从远程获取数据，参数如下：
     * ```js
     * {
     *     url: '',          // API url 地址，可为空。为空时应存在 cacheName，此时为从缓存中读取数据
     *     data: {},         // url 请求参数
     *     cache: false,     // 配置了 url 获取数据时，是否缓存数据。可取值：`false/true/sessionStorage/localStorage`
     *     fromCache: false, // 配置了 url，是否首先尝试从缓存中读取数据。可取值：`false/true/sessionStorage/localStorage`
     *     cacheName: '',    // 配置了 url 并且 cache 为 true，配置缓存数据的名称，不配置则取值 url (/ 会替换为 . 作为深度路径)
     *     expires: 0,       // 如果 cache 为 true，设置缓存数据的有效期，可为 毫秒数，或 Date 类型日期
     *     tipConfig: {delay: 2000} // ajax 出错时的提示配置。配置为 false 时，禁用全局的系统提示，包括 成功/出错/404/50x 等
     *     errAlert: true    // ajax error 时是否给出全局提示，优先级高于 settings.errAlert
     *     waiting: {}       // 按钮等待等配置，用于传递给 settings.fnWaiting 方法
     *     ajaxParam: null   // ajax 额外参数扩展，如涉及文件上传等，需要修改部分参数。其中 url 参数无效，应当使用 config.url
     * }
     * ```
     * @param {Object} callback 成功回调方法
     * @param {Object} errCallback 从 url 获取时，失败后需要做一些处理的回调方法
     * }
     */
    get(config, callback, errCallback) {
        if (!config) {
            return undefined;
        }

        let cacheData;
        const $promise = getPromise(settings.isJquery);
        const cacheName = getCacheName(config);

        // 配置了 url，从 url 中获取
        if (config.url) {
            cacheData = getCacheDataByName(cacheName, config.fromCache);

            // fromCache 为 true，尝试从缓存中获取数据
            if (config.fromCache && cacheData) {
                if (typeof callback === 'function') {
                    callback(cacheData);
                }

                $promise.resolve(cacheData);
                // return cacheData; // 返回数据
                return $promise; // 这里改了后不兼容旧的调用，应该注意 bug 的出现！
            }

            config.ajaxParam = $.extend(config.ajaxParam, {
                type: 'GET'
            });

            return requestAjax(config, callback, errCallback, (result) => {
                // cache 为 true，缓存数据
                if (config.cache) {
                    this.save(cacheName, result, config);
                }
            });
        } else if (hasOwnProperty(config, 'url')) { // 配置了 url，但 url 值为空
            logTrace(ERRURLMSG, config);
            $promise.reject(ERRURLMSG, config);
        } else {
            // 未配置 url，则必须配置 config.cacheName，或者 config 为字符串(作为cacheName)，此时为从缓存中取得数据
            cacheData = getCacheDataByName(cacheName, config.fromCache || callback);

            if (callback instanceof Function) {
                callback(cacheData);
            }

            return cacheData;
        }

        return $promise;
    },
    /**
     * 设置/存储数据
     * @param {Object|String} config - 配置信息。也可以为字符串，则为需存储的数据名称。与 {@link module:adm~get} 的 config 参数相同
     * @param {Function|Object} callback - 存储成功后回调方法。当 config 为字符串时，为需存储的数据，或方法执行后返回要存储的数据
     * @param {Function|String} errCallback - 从 url 获取时，失败后需要做一些处理的回调方法。config 为字符串时，为配置信息，如 {cacheType, expires}
     * @example
     * // 存储数据到 localStorage，名称为 testdataName
     * adm.save('testdataName', {test: 1}, 'localStorage');
     * @example
     * // 存储数据到远程，同时将 API 返回的结果存储到 sessionStorage
     * adm.save({url: '/rest/dd', data: {test: 1}, cache: 'sessionStorage'});
     */
    save(config, callback, errCallback) {
        const $promise = getPromise(settings.isJquery);
        const resolve = $promise.resolve;
        const reject = $promise.reject;

        if (!config) {
            resolve();
            return $promise;
        }

        let cacheData;
        const cacheName = getCacheName(config, true);

        if (isString(config)) { // config 为字符串，则作为cacheName
            if (callback instanceof Function) { // 可以存储为回调方法执行后的结果
                saveTOCache(cacheName, callback(), errCallback);
            } else {
                saveTOCache(cacheName, callback, errCallback);
            }
            resolve(cacheName);
        } else if (config.url) { // 配置了 url，将数据存储到远程
            cacheData = getCacheDataByName(cacheName, config.fromCache);

            // fromCache 为 true，尝试从缓存中获取数据
            if (config.fromCache && cacheData) {
                if (callback instanceof Function) {
                    callback(cacheData);
                }

                resolve(cacheData);
                // return cacheData; // 返回数据
                return $promise; // 这里改了后不兼容旧的调用，应该注意 bug 的出现！
            }

            config.ajaxParam = $.extend({
                type: 'POST'
            }, config.ajaxParam);

            return requestAjax(config, callback, errCallback, (result) => {
                if (config.cache) {
                    // 远程存储成功了，本地也需缓存数据时
                    saveTOCache(cacheName, result, config);
                }
            });
        } else if (hasOwnProperty(config, 'url')) { // 配置了url，但 url 值为空
            logTrace(ERRURLMSG, config);
            reject(ERRURLMSG, config);
        } else if (cacheName) { // 没有设置 url，但设置了 config.cacheName(此时 cacheName=config.cacheName)，则保存数据到本地
            saveTOCache(cacheName, config.data, config);

            if (callback instanceof Function) {
                callback(cacheData);
            }
            resolve(config.data);
        }

        return $promise;
    },
    /**
     * 删除一个数据
     * @param {Object} config - 为字符串时，作为 cacheName 尝试从缓存中删除数据。否则格式如下：
     * ```js
     * {
     *     url: '',       // 配置了 url，从远程删除数据，否则从缓存中删除
     *     cache: false,  // 配置了 url，是否还尝试从缓存中删除数据。可取值：false/true/sessionStorage/localStorage
     *     cacheName: ''  // 从缓存中删除数据时，提供其名称。
     * }
     * ```
     */
    delete(config, callback, errCallback) {
        if (!config) {
            return '';
        }

        const $promise = getPromise(settings.isJquery);
        const cacheName = getCacheName(config);

        if (isString(config) || config instanceof RegExp) {
            // 第一个参数为字符串或正则，callback 就是 cacheType
            deleteCacheDataByName(config, callback);
            // 删除完成都返回执行成功
            $promise.resolve();
        } else if (config.url) {
            // 配置了 url，从远程删除数据
            return requestAjax(config, callback, errCallback, {
                type: 'DELETE'
            }, () => {
                if (config.cache) {
                    // 远程删除成功了，本地也需清空时
                    deleteCacheDataByName(cacheName, config.cache);
                }
            });
        } else if (hasOwnProperty(config, 'url')) { // 配置了url，但 url 值为空
            logTrace(ERRURLMSG, config);
            $promise.reject(ERRURLMSG, config);
        } else if (cacheName) {
            deleteCacheDataByName(cacheName, config.cache);
            $promise.resolve();
        }

        return $promise;
    },
    /**
     * 返回所有存储中的所有数据
     * @param  {String} cacheType 存储的类型：sessionStorage、localStorage 或 memory
     * @return {Object}
     */
    getAll(cacheType) {
        const cacheStor = getCacheStor(cacheType);
        const _cache = {};
        const len = cacheStor.length;
        let i;
        let item, key;

        for (i = 0; i < len; i++) {
            item = cacheStor.key(i);

            if (!item || 0 !== item.indexOf(settings.cachePrefix)) {
                continue;
            }

            key = item.replace(settings.cachePrefix, '');
            try {
                _cache[key] = JSON.parse(cacheStor.getItem(item));
            } catch (e) {
                _cache[key] = cacheStor.getItem(item);
            }
        }

        return _cache;
    },
    /**
     * {@link module:dataModel.get} 的 ajax 快捷方法
     * @see  module:dataModel.get
     * @param  {String}   url         url 地址
     * @param  {Object}  data        要传递的参数，可省略
     * @param  {Function} callback    成功回调
     * @param  {Function}   errCallback 失败回调
     * @returns {Promise}
     */
    getJSON(url, data = {}, callback, errCallback) {
        // data 参数可以省略
        if (data instanceof Function) {
            errCallback = callback;
            callback = data;
            data = void 0;
        }

        return this.get({
            url,
            data
        }, callback, errCallback);
    },
    /**
     * {@link module:dataModel.save} 的 ajax 快捷方法
     * @see  module:dataModel.save
     * @param  {String}   url         url 地址
     * @param  {Object}  data        要传递的参数
     * @param  {Function} callback    成功回调
     * @param  {Function}   errCallback 失败回调
     * @returns {Promise}
     */
    post(url, data, callback, errCallback) {
        return this.save({
            url,
            data
        }, callback, errCallback);
    },
    /**
     * 根据存储类型清空存储的所有数据
     * @param  {String} cacheType
     * @return {scope} this
     */
    clear(cacheType) {
        deleteCacheDataByName(new RegExp('.*'), cacheType);

        return this;
    },
    /**
     * 修改缓存数据的前缀
     * @param {String} prefix           以下划线开头，由字母、数字、或下划线组成
     * @param {Boolean} clear[=true]    修改前缀前，是否移除已有的数据
     */
    setCachePrefix(prefix, clear = true) {
        if (!/^_[_a-zA-Z]*_$/.test(prefix)) {
            console.warn('以下划线开头和结尾，由字母、数字、或下划线组成');
            return this;
        }

        if (clear) {
            this.clear('sessionStorage');
            this.clear('localStorage');
            this.clear();
        }

        settings.cachePrefix = prefix;

        return this;
    },
    /**
     * 设置配置项
     * @param {Object} setting
     */
    setSettings(setting) {
        let item;

        for (item in setting) {
            if ('cachePrefix' === item) {
                this.setCachePrefix(setting[item], false);
            } else if (hasOwnProperty(settings, item)) {
                settings[item] = setting[item];
            }
        }

        return settings;
    }
};
