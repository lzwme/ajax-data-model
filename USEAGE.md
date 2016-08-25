# ajax-data-model 使用示例

## 初始化设置

```javascript
//adm.js

import $ from 'jquery';
import adm from 'ajax-data-model';

// 通过这里的设置，实现基于接口约定的通用性处理，可以设置一个或多个参数
adm.setSettings({
    cachePrefix: '__DM__', // 缓存数据时使用的前缀
    alert: (msg) => {      // 全局性提示方法注册，根据项目的 alert 组件进行注册
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

            if (config.tipConfig) {
                config.tipConfig.message = result.message || '系统错误';
                MZ.tipmessage.fail(config.tipConfig);
            } else {
                this.alert(result.message || '系统错误');
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
});

export default adm;
```

## 使用示例

### 使用示例一：

* 基本的 ajax 请求
* 几种回调方法示例

```javascript
import adm from `adm`;

let param = {
    url: '/rest/user/list'
};

// 基本的 ajax 请求
adm.get(param, (result) => {
    console.log(result)
}, (err) => {
    console.log(err);
});

// Promise 方式处理回调
adm.get(param)
    .then((result) => {
        console.log(result)
    }, (err) => {
        console.log(err);
    });

// $.Deferred 的 done/fail 方式处理回调
adm.get(param)
    .done((result) => {
        console.log(result)
    })
    .fail((err) => {
        console.log(err);
    });
```

### 使用示例二：

缓存到 `sessionStorage` 示例，适合很少变动的元数据
```
let param = {
    url: '/rest/user/list',
    cache: 'sessionStorage', // 从 url 读取到了数据时，也缓存到 `sessionStorage`
    fromCache: 'sessionStorage', //优先从 `sessionStorage` 获取数据
    cacheName: 'userlist' //不写则使用 url 格式化：`rest.user.list`
};

adm.get(param).then((result) => {}, (err) => {});
```
缓存到内存示例，适合单页应用
```
let param = {
    url: '/rest/user/list',
    cache: true, // 从 url 读取到了数据时，也缓存到内存中
    fromCache: true, //优先从内存获取数据
    cacheName: 'userlist' //不写则使用 url 格式化：`rest.user.list`
};

adm.get(param).then((result) => {}, (err) => {});
```
缓存到 `localStorage` 示例，适合永远不会的数据

```
let param = {
    url: '/rest/user/list',
    cache: 'localStorage',
    fromCache: 'localStorage'
};

adm.get(param).then((result) => {}, (err) => {});

// 从 localStorage 中删除
adm.delete(param.url, 'localStorage');
```

### 使用示例三：

* adm.get/adm.save
* `waiting` 参数，按钮状态处理
* `data` 参数

```
let param = {
    url: '/rest/user',
    data: {
        userId: 22
    },
    waiting: {
        $btn: $('#submit'),
        text: '获取中...'
    }
};

adm.get(param).then((result) => {}, (err) => {});
```

save 方法使用 `POST` 方式提交。示例：

```javascript
let param = {
    url: '/rest/save/user',
    data: {
        userId: 22,
        username: 'lzwme',
        website: 'https://lzw.me'
    },
    waiting: {
        $btn: $('#submit'),
        text: '正在提交...'
    }
};

adm.save(param).then((result) => {}, (err) => {});
```

### 使用示例四

无 ajax 的数据读写删

```javascript

let data = {
    user: 'renxia',
    site: 'https://lzw.me'
};

// 存到内存中
adm.save('user_renxia', data);
// 存到 sessionStorage
adm.save('user_renxia', data, 'sessionStorage');
// 存到 localStorage
adm.save('user_renxia', data, 'localStorage');

// 读取
let cache;

// 从内存中
cache = adm.get('user_renxia');
console.log('从内存读取(user_renxia): ', cache);

// 从 sessionStorage
cache = adm.get('user_renxia', 'sessionStorage');
console.log('从 sessionStorage 读取(user_renxia): ', cache);

// 从 localStorage
cache = adm.get('user_renxia', 'localStorage');
console.log('从 localStorage 读取(user_renxia): ', cache);

// 删除

// 从内存中删除
adm.delete('user_renxia');
cache = adm.get('user_renxia');
console.log('从内存读取(user_renxia): ', cache); // undefined
```

more...