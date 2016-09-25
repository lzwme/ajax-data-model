/**
 * @desc 配置信息，可以通过 `adm.setSettings` 方法修改
 * @alias settings
 * @type {Object}
 */
export default {
    cachePrefix: '__DM__', // 缓存数据时使用的前缀，用于区别普通数据
    isJquery: true,        // 是否使用 jQuery 的 $.Deferred。为 false 则使用 Promise
    errAlert: true,        // ajax 出错时是否全局提示，fnAjaxFail 中使用。全局性开关
    alert: (msg) => {      // 全局性提示方法注册，可根据项目的 alert 组件进行注册
        console.trace(msg);
        // window.alert(msg);
    },
    /**
     * ajax 开始/结束时回调方法
     * 例如单击按钮后，在开始时禁用按钮，结束时恢复它；
     * 再例如，在 ajax 开始时启用页面动画，结束时关闭页面动画。
     * @param  {Object}  waiting - 来自于 `data.waiting` 参数，参数内容可根据 `fnWaiting` 具体的处理来设置
     * @param  {Number} time - 存在值时在 ajax 结束调用，值为 ajax 消耗的时间；省略时在 ajax 开始前被调用
     * @return {void}
     */
    fnWaiting(waiting, time) {
        // if ('development' === process.env.NODE_ENV && time) {
        //     console.trace('ajax 请求消耗时间：', time);
        // }
        // if (!waiting) {
        //     return;
        // }
        // more...
    },
    /**
     * ajax 请求开始前回调方法
     * @param  {Object} config - ajax 请求配置，由于是引用传参，可在这里通过修改它实现 mock 数据等功能
     * @return {void}
     */
    fnBeforeAjax(config) {},
    /**
     * 通用 ajax 请求返回时回调方法
     * 对于基于接口的约定，如这里的示例：以 `code` 为 `200` 认为是成功的数据，否则为出错
     * @param {Object} result - ajax 返回的数据结果
     * @param {Function} callback - 成功回调方法
     * @param {Function} errCallback - 出错回调方法
     * @param {Object} config - ajax 请求参数配置，即 `adm.get/save` 的第一个参数
     * @returns {Boolean|Object|Promise} 表示成功或失败，或成功后返回的数据(如对 result 处理后返回)，或 Promise 风格回调
     */
    fnAjaxDone(result, callback, errCallback, config) {
        let success = false;

        if (result && result.code === 200) {
            if (callback) {
                callback(result);
            }

            // code 200 认为成功，否则认为失败
            success = true;
        } else {
            if (errCallback) {
                errCallback(result);
            }

            // 全局性系统提示，设置为 false，则不提示，适合由用户自定义错误处理的情况
            if (config.tipConfig !== false) {
                result.message = result.message || '系统错误';
                this.alert(result.message);
            }

        }

        return success;
    },
    /**
     * ajax 失败回调方法，一般为 30x、40x、50x 或返回格式不对、网络中断等
     * @param  {Object} err
     * @param  {Object} config
     * @return {void}
     */
    fnAjaxFail(err, config) {
        if (0 === err.status) {
            this.alert('登录超时');
            // window.location.reload();
        } else if (config.errAlert || undefined === config.errAlert && this.errAlert) {
            // errAlert = false 时禁止 40x/50x 等错误的全局提示，可全局禁止，或本次禁止
            this.alert('数据请求失败: ' + (err.responseText || err.statusText));
        }
    }
};
