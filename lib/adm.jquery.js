(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("adm", [], factory);
	else if(typeof exports === 'object')
		exports["adm"] = factory();
	else
		root["adm"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @file 全局数据模型 model
	 * 提供数据的读取、保存/缓存、删除、更新等操作。各模块 model 可继承该模型，以进行模块范围内的数据存取操作。
	 * @module adm
	 * @author lizhiwen@meizu.com
	 * @since 2016-03-31 - 2016-08-16
	 *
	 * @example
	 * import adm from 'ajax-data-model';
	 * let upsModel = $.extend(true, {}, adm, {aa: 'ccc', restapi: {task_type: '/rest/task/type'}});
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
	 * // 获取 task_type 数据，并缓存到 sessionStorage。获取时优先从 sessionStorage 读取
	 * DW.adm.get({
	 *     url: upsModel.restapi.task_type,
	 *     cache: 'sessionStorage',
	 *     fromCache: 'sessionStorage',
	 *     cacheName: 'task_dependType'
	 * }).done((result) => {
	 *     let taskTypeList = result.value || [];
	 *     console.log(taskTypeList);
	 * });
	 */
	'use strict';
	
	// import $ from 'jquery';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _settings = __webpack_require__(2);
	
	var _settings2 = _interopRequireDefault(_settings);
	
	var _cacheHelper = __webpack_require__(3);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * ajax 请求通用方法
	 * @param {Object}   config - 请求参数配置
	 * @param {String}   config.url - ajax url，必须存在，`config.ajaxParam` 中配置此参数无效
	 * @param {Object}   config.ajaxParam - ajax 额外参数扩展，如涉及文件上传等
	 * @param {Object}   config.data - ajax 请求的参数
	 * @param {Object}   config.waiting - 用于传递给 settings.fnWaiting 方法使用的参数配置
	 * @param {Object}   config.tipConfig[true] - ajax 出错时的提示配置。配置为 false 时，禁用全局的系统提示，包括 成功/出错/404/50x 等
	 * @param {Object}   config.errAlert[true] - ajax error 时是否给出全局提示
	 * @param {Function} callback - ajax 请求成功时回调
	 * @param {Function} errCallback - ajax 请求失败或 code !== 200 时回调
	 * @param {Object}   param - 传递给 ajax 请求的额外参数
	 * @param {Function} fnCB - 请求到数据之后的立即回调方法，用于请求成功后需要前置处理的情况
	 * @return {Object}  ajax - $.Deferred，用于自定义回调处理。注意：ajax 请求的 done/fail 回调，与 callback/errCallback 有区别，不会处理 code 是否为 200！
	 */
	function requestAjax(config, callback, errCallback, fnCB) {
	    if (!config.url || typeof config.url !== 'string') {
	        console.trace('请求 URL API 不存在，或格式不对：', config.url);
	        return $.Deferred().reject('请求 URL API 不存在，或格式不对：', config.url);
	    }
	
	    // data.btnWaiting 的兼容，应使用 config.waiting 参数
	    if (config.data && config.data.btnWaiting) {
	        config.waiting = config.waiting || config.data.btnWaiting;
	        delete config.data.btnWaiting;
	    }
	
	    // ajax 请求前处理
	    if (config.waiting) {
	        _settings2.default.fnWaiting(config.waiting);
	    }
	
	    // jsonp 兼容
	    var dataType = 'json';
	
	    if (/^https?:\/\//.test(config.url) && config.url.search(window.location.host) === -1) {
	        dataType = 'jsonp';
	    }
	
	    // 请求前回调
	    if (_settings2.default.fnBeforeAjax) {
	        _settings2.default.fnBeforeAjax(config);
	    }
	
	    var ajax = $.ajax($.extend(true, {
	        type: 'GET',
	        dataType: dataType
	    }, config.ajaxParam, {
	        url: config.url,
	        data: config.data
	    })).done(function (result) {
	        return _settings2.default.fnAjaxDone(result, function (res) {
	            if ($.isFunction(fnCB)) {
	                fnCB(result);
	            }
	
	            if ($.isFunction(callback)) {
	                callback(res);
	            }
	        }, errCallback, config);
	    }).fail(function (err) {
	        _settings2.default.fnAjaxFail(err, config);
	
	        if ($.isFunction(errCallback)) {
	            errCallback(err);
	        }
	    }).always(function () {
	        if (config.waiting) {
	            _settings2.default.fnWaiting(config.waiting, true);
	        }
	    });
	
	    return ajax; // 返回 Promise 对象
	}
	
	/**
	 * 全局数据模型 model
	 * @alias module:adm
	 * @type {Object}
	 */
	exports.default = {
	    /**
	     * 数据获取，可为远程url、缓存等
	     * @param {Object} config 为字符串时，从缓存中读取数据，否则为从远程获取数据，参数如下：
	     * ```js
	     * {
	     *     url: '',
	     *     data: {},         // url 请求参数
	     *     cache: false,     // 配置了 url 获取数据时，是否缓存数据。可取值：`false/true/sessionStorage/localStorage`
	     *     fromCache: false, // 配置了 url，是否首先尝试从缓存中读取数据。可取值：`false/true/sessionStorage/localStorage`
	     *     cacheName: 'ddd', // 配置了 url，如果缓存数据，配置其名称，不配置则取值 url (/ 替换为 . 作为深度路径)
	     *     tipConfig: {delay: 2000} // ajax 出错时的提示配置。配置为 false 时，禁用全局的系统提示，包括 成功/出错/404/50x 等
	     *     errAlert: true    // ajax error 时是否给出全局提示
	     *     waiting: {}       // 按钮等待等配置，用于传递给 settings.fnWaiting 方法
	     *     ajaxParam: null   // ajax 额外参数扩展，如涉及文件上传等，需要修改部分参数。其中 url 参数无效，应当使用 config.url
	     * }
	     * ```
	     * @param {Object} callback 成功回调方法
	     * @param {Object} errCallback 从 url 获取时，失败后需要做一些处理的回调方法
	     * }
	     */
	
	    get: function get(config, callback, errCallback) {
	        var _this = this;
	
	        if (!config) {
	            return undefined;
	        }
	
	        var cacheName = void 0,
	            cacheData = void 0,
	            $promise = $.Deferred();
	
	        if ((0, _cacheHelper.isString)(config)) {
	            // 第一个参数为字符串，则为名称，直接返回对应值
	            cacheName = config;
	        }
	
	        // 配置了 url，从 url 中获取
	        if (config.url) {
	            cacheName = config.cacheName || config.url;
	            cacheData = (0, _cacheHelper.getCacheDataByName)(cacheName, config.fromCache);
	
	            // fromCache 为 true，尝试从缓存中获取数据
	            if (config.fromCache && cacheData) {
	                if ($.isFunction(callback)) {
	                    callback(cacheData);
	                }
	
	                $promise.resolve(cacheData);
	                // return cacheData; // 返回数据
	                return $promise; // 这里改了后不兼容旧的调用，应该注意 bug 的出现！
	            }
	
	            config.ajaxParam = $.extend(config.ajaxParam, {
	                type: 'GET'
	            });
	
	            return requestAjax(config, callback, errCallback, function (result) {
	                // cache 为 true，缓存数据
	                if (config.cache && Number(result.code) === 200) {
	                    _this.save(cacheName, result, config.cache);
	                }
	            });
	        } else if (config.hasOwnProperty('url')) {
	            // 配置了 url，但 url 值为空
	            console.trace('配置了 URL 参数，但值为空：', config);
	            $promise.reject('配置了 URL 参数，但值为空', config);
	        } else {
	            // 未配置 url，则必须配置 cacheName，或者 config 为字符串(作为cacheName)，从缓存中取得数据
	            if (!cacheName && config) {
	                cacheName = config.cacheName;
	            }
	            cacheData = (0, _cacheHelper.getCacheDataByName)(cacheName, config.fromCache || callback);
	
	            if ($.isFunction(callback)) {
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
	     * @param {Function|String} errCallback - 从 url 获取时，失败后需要做一些处理的回调方法。config 为字符串时，为 cacheType 类型
	     * @example
	     * // 存储数据到 localStorage，名称为 testdataName
	     * adm.save('testdataName', {test: 1}, 'localStorage');
	     * @example
	     * // 存储数据到远程，同时存储到 sessionStorage
	     * adm.save({url: '/rest/dd', data: {test: 1}, cache: 'sessionStorage'});
	     */
	    save: function save(config, callback, errCallback) {
	        if (!config) {
	            return '';
	        }
	
	        var cacheName = void 0,
	            cacheData = void 0,
	            $promise = $.Deferred();
	
	        if ((0, _cacheHelper.isString)(config)) {
	            // config 为字符串，则作为cacheName
	            cacheName = '' + config;
	            if ($.isFunction(callback)) {
	                // 可以存储为回调方法执行后的结果
	                (0, _cacheHelper.saveTOCache)(cacheName, callback(), errCallback);
	            } else {
	                (0, _cacheHelper.saveTOCache)(cacheName, callback, errCallback);
	            }
	        } else if (config.url) {
	            // 配置了 url，将数据存储到远程
	            config.ajaxParam = $.extend({
	                type: 'POST'
	            }, config.ajaxParam);
	
	            return requestAjax(config, callback, errCallback, function (result) {
	                if (config.cache) {
	                    cacheName = cacheName || config.url;
	                    // 远程存储成功了，本地也需缓存数据时
	                    (0, _cacheHelper.saveTOCache)(cacheName, result, config.cache);
	                }
	            });
	        } else if (config.hasOwnProperty('url')) {
	            // 配置了url，但 url 值为空
	            console.trace('配置了 URL 参数，但值为空：', config);
	            $promise.reject('配置了 URL 参数，但值为空', config);
	        } else if (config.cacheName) {
	            // 没有设置 url，但设置了 cacheName，则保存数据到本地
	            (0, _cacheHelper.saveTOCache)(config.cacheName, config.data, config.cache);
	
	            if ($.isFunction(callback)) {
	                callback(cacheData);
	            }
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
	    delete: function _delete(config, callback, errCallback) {
	        if (!config) {
	            return '';
	        }
	
	        var $promise = $.Deferred(),
	            cacheName = void 0;
	
	        if ((0, _cacheHelper.isString)(config) || config instanceof RegExp) {
	            // 第一个参数为字符串或正则，callback 就是 cacheType
	            (0, _cacheHelper.deleteCacheDataByName)(config, callback);
	            // 删除完成都返回执行成功
	            $promise.resolve();
	        } else if (config.url) {
	            // 配置了 url，从远程删除数据
	            return requestAjax(config, callback, errCallback, {
	                type: 'DELETE'
	            }, function () {
	                if (config.cache) {
	                    // 远程删除成功了，本地也需清空时
	                    cacheName = config.cacheName || config.url;
	                    (0, _cacheHelper.deleteCacheDataByName)(cacheName, config.cache);
	                }
	            });
	        } else if (config.hasOwnProperty('url')) {
	            // 配置了url，但 url 值为空
	            console.trace('配置了 URL 参数，但值为空：', config);
	            $promise.reject('配置了 URL 参数，但值为空', config);
	        } else if (config && config.cacheName) {
	            (0, _cacheHelper.deleteCacheDataByName)(config.cacheName, config.cache);
	            $promise.resolve();
	        }
	
	        return $promise;
	    },
	
	    /**
	     * 返回所有存储中的所有数据
	     * @param  {String} cacheType 存储的类型：sessionStorage、localStorage 或 memory
	     * @return {Object}
	     */
	    getAll: function getAll(cacheType) {
	        var cacheStor = (0, _cacheHelper.getCacheStor)(cacheType);
	        var item = void 0,
	            key = void 0,
	            _cache = {};
	
	        // 存到内存的地方在 cache 中
	        if (cacheStor.constructor.name === 'DataCache') {
	            cacheStor = cacheStor.cache;
	        }
	
	        for (item in cacheStor) {
	            if (!cacheStor.hasOwnProperty(item)) {
	                continue;
	            }
	
	            if (0 !== item.indexOf(_settings2.default.cachePrefix)) {
	                continue;
	            }
	
	            key = item.replace(_settings2.default.cachePrefix, '');
	            try {
	                _cache[key] = JSON.parse(cacheStor[item]);
	            } catch (e) {
	                _cache[key] = cacheStor[item];
	            }
	        }
	
	        return _cache;
	    },
	
	    /**
	     * 根据存储类型清空存储的所有数据
	     * @param  {String} cacheType
	     * @return {scope} this
	     */
	    clear: function clear(cacheType) {
	        (0, _cacheHelper.deleteCacheDataByName)(new RegExp('.*'), cacheType);
	
	        return this;
	    },
	
	    /**
	     * 修改缓存数据的前缀
	     * @param {String} prefix           以下划线开头，由字母、数字、或下划线组成
	     * @param {Boolean} clear[=true]    修改前缀前，是否移除已有的数据
	     */
	    setCachePrefix: function setCachePrefix(prefix) {
	        var clear = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
	
	        if (!/^_[_a-zA-Z]*_$/.test(prefix)) {
	            console.warn('以下划线开头和结尾，由字母、数字、或下划线组成');
	            return this;
	        }
	
	        if (clear) {
	            this.clear('sessionStorage');
	            this.clear('localStorage');
	            this.clear();
	        }
	
	        _settings2.default.cachePrefix = prefix;
	
	        return this;
	    },
	
	    /**
	     * 设置配置项
	     * @param {Object} setting
	     */
	    setSettings: function setSettings(setting) {
	        var item = void 0;
	
	        for (item in setting) {
	            if ('cachePrefix' === item) {
	                this.setCachePrefix(setting[item], true);
	            } else if (_settings2.default.hasOwnProperty(item)) {
	                _settings2.default[item] = setting[item];
	            }
	        }
	
	        return _settings2.default;
	    }
	};
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * @desc 配置信息，可以通过 `adm.setSettings` 方法修改
	 * @alias settings
	 * @type {Object}
	 */
	exports.default = {
	    cachePrefix: '__DM__', // 缓存数据时使用的前缀
	    alert: function alert(msg) {
	        // 全局性提示方法注册，可根据项目的 alert 组件进行注册
	        console.trace(msg);
	        // window.alert(msg);
	    },
	    /**
	     * ajax 开始/结束时的状态处理
	     * 例如单击按钮后，在开始时禁用按钮，结束时恢复它；
	     * 再例如，在 ajax 开始时启用页面动画，结束时关闭页面动画。
	     * @param  {Object}  wait - 来自于 `data.btnWaiting` 参数，参数内容可根据 `fnWaiting` 具体的处理来设置。例如这里为：
	     * `{$btn:$btn, text:"请求中..", defaultText: "提交"}`
	     * @param  {Boolean} isEnd - true 时在 ajax 开始调用；为 false 时在 ajax 结束调用
	     * @return {void}
	     */
	    fnWaiting: function fnWaiting(wait, isEnd) {
	        if (wait && wait.$btn && wait.$btn.length) {
	            if (!isEnd) {
	                wait.$btn.data('defaultText', wait.$btn.html()).html(wait.text || '<i class="fa fa-spinner rotateIn animated infinite"></i> 请求中...').addClass('disabled').prop('disabled', true);
	            } else {
	                setTimeout(function () {
	                    // 连续提交延时处理，两次连续提交不能超过 200 ms
	                    wait.$btn.html(wait.defaultText || wait.$btn.data('defaultText')).removeClass('disabled').prop('disabled', false);
	                }, 200);
	            }
	        }
	    },
	
	    /**
	     * ajax 请求前回调方法
	     * @param  {Object} config - ajax 请求配置，由于是引用传参，可在这里通过修改它实现 mock 数据等功能
	     * @return {void}
	     */
	    fnBeforeAjax: function fnBeforeAjax(config) {},
	
	    /**
	     * 通用 ajax 请求返回处理
	     * 对于接口的约定，如这里以 `code` 为 `200` 认为是成功的数据，否则为出错
	     * @param {Object} result - ajax 返回的数据结果
	     * @param {Function} callback - 成功回调方法
	     * @param {Function} errCallback - 出错回调方法
	     * @param {Object} config - ajax 请求参数配置，即 `adm.get/save` 的第一个参数
	     */
	    fnAjaxDone: function fnAjaxDone(result, callback, errCallback, config) {
	        var $d = $.Deferred();
	
	        if (result && result.code === 200) {
	            if (callback) {
	                callback(result);
	            }
	
	            // code 200 认为成功，否则认为失败
	            $d.resolve(result);
	        } else {
	            $d.reject(result);
	
	            if (errCallback) {
	                errCallback(result);
	            }
	
	            // 设置为 false，则不进行系统提示，适合由用户自定义错误处理的情况
	            if (config.tipConfig === false) {
	                return $d;
	            }
	
	            result.message = result.message || '系统错误';
	            if (config.tipConfig) {
	                // 注册另一种系统提示
	                // config.tipConfig.message = result.message;
	                // MZ.tipmessage.fail(config.tipConfig);
	            } else {
	                    this.alert(result.message);
	                }
	        }
	
	        return $d;
	    },
	
	    /**
	     * ajax 失败处理，一般为 30x、40x、50x 或返回格式不对、网络中断等
	     * @param  {Object} err
	     * @param  {Object} config
	     * @return {void}
	     */
	    fnAjaxFail: function fnAjaxFail(err, config) {
	        if (0 === err.status) {
	            this.alert('登录超时');
	            window.location.reload();
	        } else if (false !== config.errAlert) {
	            // errAlert = false 时禁止 40x/50x 等错误的全局提示
	            this.alert('数据请求失败: ' + (err.responseText || err.statusText));
	        }
	    }
	};
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                   * cache helper
	                                                                                                                                                                                                                                                   */
	
	
	exports.getCacheStor = getCacheStor;
	exports.getCacheDataByName = getCacheDataByName;
	exports.deleteCacheDataByName = deleteCacheDataByName;
	exports.saveTOCache = saveTOCache;
	exports.isString = isString;
	
	var _settings = __webpack_require__(2);
	
	var _settings2 = _interopRequireDefault(_settings);
	
	var _DataCache = __webpack_require__(4);
	
	var _DataCache2 = _interopRequireDefault(_DataCache);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// 缓存数据对象。为了避免混淆，只缓存至一级结构
	var dataCache = new _DataCache2.default();
	
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
	    if (cacheName.indexOf(_settings2.default.cachePrefix) !== 0) {
	        cacheName = _settings2.default.cachePrefix + cacheName;
	    }
	
	    return cacheName;
	}
	/**
	 * 根据 cacheType 取得 cacheStorage 对象
	 * @param  {String} cacheType
	 * @return {Object}
	 */
	function getCacheStor(cacheType) {
	    var cacheStor = dataCache;
	
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
	function getCacheDataByName(cacheName, cacheType) {
	    var data = void 0,
	        cacheStor = getCacheStor(cacheType);
	
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
	function deleteCacheDataByName(cacheName, cacheType) {
	    var item = void 0,
	        cacheStor = getCacheStor(cacheType),
	        cache = cacheStor;
	
	    if (cacheStor.constructor.name === 'DataCache') {
	        cache = cacheStor.cache;
	    }
	
	    // 为正则，支持模糊删除
	    if (cacheName instanceof RegExp) {
	        for (item in cache) {
	            if (!cache.hasOwnProperty(item) || // 自有属性
	            item.indexOf(_settings2.default.cachePrefix) !== 0 // 过滤前缀
	            ) {
	                    continue;
	                }
	
	            // 规则检测
	            if (!cacheName.test(item.slice(_settings2.default.cachePrefix.length))) {
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
	function saveTOCache(cacheName, data, cacheType) {
	    if (!(cacheName = adjustCacheName(cacheName))) {
	        return;
	    }
	
	    var cacheStor = getCacheStor(cacheType);
	
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
	function isString(text) {
	    var type = typeof text === 'undefined' ? 'undefined' : _typeof(text);
	
	    if ('string' === type || 'number' === type) {
	        return true;
	    }
	    return false;
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * @file 基本的数据缓存类
	 */
	
	/**
	 * 内存缓存数据对象类，与 `localStorage` API 保持一致
	 */
	
	var DataCache = function () {
	    function DataCache() {
	        _classCallCheck(this, DataCache);
	
	        this.length = 0;
	        this.cache = {};
	    }
	    /**
	     * 获取值
	     * @param  {String} key
	     * @return {*}
	     */
	
	
	    _createClass(DataCache, [{
	        key: "getItem",
	        value: function getItem(key) {
	            return this.cache[key];
	        }
	        /**
	         * 设置值
	         * @param {String} key
	         * @param {*} value
	         */
	
	    }, {
	        key: "setItem",
	        value: function setItem(key, value) {
	            this.cache[key] = value;
	            this.length++;
	        }
	        /**
	         * 删除一个值
	         * @param  {String} key
	         * @return {void}
	         */
	
	    }, {
	        key: "removeItem",
	        value: function removeItem(key) {
	            if (this.cache.hasOwnProperty(key)) {
	                this.length--;
	                delete this.cache[key];
	            }
	        }
	        /**
	         * 清空
	         */
	
	    }, {
	        key: "celar",
	        value: function celar() {
	            this.length = 0;
	            this.cache = {};
	        }
	        /**
	         * 取得第 index 个值
	         * @param  {Number} index
	         * @return {*}
	         */
	
	    }, {
	        key: "key",
	        value: function key(index) {
	            var item = void 0,
	                _index = 0;
	
	            for (item in this.cache) {
	                if (index === _index) {
	                    return this.cache[item];
	                }
	                _index++;
	            }
	
	            return null;
	        }
	    }]);
	
	    return DataCache;
	}();
	
	exports.default = DataCache;
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;
//# sourceMappingURL=adm.jquery.js.map