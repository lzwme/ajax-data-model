/**
 * @desc 配置信息，可以通过 `adm.setSettings` 方法修改
 * @alias settings
 * @type {Object}
 */
export default {
    cachePrefix: '__DM__', // 缓存数据时使用的前缀
    isJquery: true,        // 是否使用 jQuery 的 $.Deferred。为 false 则使用 Promise
    alert: (msg) => {      // 全局性提示方法注册，可根据项目的 alert 组件进行注册
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
    fnWaiting(wait, isEnd) {
        if (wait && wait.$btn && wait.$btn.length) {
            if (!isEnd) {
                wait.$btn.data('defaultText', wait.$btn.html())
                    .html(wait.text || '<i class="fa fa-spinner rotateIn animated infinite"></i> 请求中...')
                    .addClass('disabled').prop('disabled', true);
            } else {
                setTimeout(function () {
                    // 连续提交延时处理，两次连续提交不能超过 200 ms
                    wait.$btn.html(wait.defaultText || wait.$btn.data('defaultText'))
                        .removeClass('disabled').prop('disabled', false);
                }, 200);
            }
        }
    },
    /**
     * ajax 请求前回调方法
     * @param  {Object} config - ajax 请求配置，由于是引用传参，可在这里通过修改它实现 mock 数据等功能
     * @return {void}
     */
    fnBeforeAjax(config) {},
    /**
     * 通用 ajax 请求返回处理
     * 对于接口的约定，如这里以 `code` 为 `200` 认为是成功的数据，否则为出错
     * @param {Object} result - ajax 返回的数据结果
     * @param {Function} callback - 成功回调方法
     * @param {Function} errCallback - 出错回调方法
     * @param {Object} config - ajax 请求参数配置，即 `adm.get/save` 的第一个参数
     */
    fnAjaxDone(result, callback, errCallback, config) {
        let $d = $.Deferred();

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
    fnAjaxFail(err, config) {
        if (0 === err.status) {
            this.alert('登录超时');
            window.location.reload();
        } else if (false !== config.errAlert) {
            // errAlert = false 时禁止 40x/50x 等错误的全局提示
            this.alert('数据请求失败: ' + (err.responseText || err.statusText));
        }
    }
};
