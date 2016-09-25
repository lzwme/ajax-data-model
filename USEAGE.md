# ajax-data-model 使用示例

## 初始化设置

根据具体的项目和开发规范/习惯，设置 ajax 请求过程的一系列通用约定动作

```javascript
//adm.js

import $ from 'jquery';
import adm from 'ajax-data-model';

// 通过这里的设置，实现基于接口约定的通用性处理，可以设置一个或多个参数
adm.setSettings({
    cachePrefix: '__DM__', // 缓存数据时使用的前缀，用于区别普通数据
    isJquery: true,        // 是否使用 jQuery 的 $.Deferred。为 false 则使用 Promise
    errAlert: true,        // ajax 出错时是否全局提示，fnAjaxFail 中使用。全局性开关
    alert: (msg) => {      // 全局性提示方法注册，根据项目的 alert 组件进行注册
        // console.trace(msg);
        // window.alert(msg);
        DW.modal.alert(msg);
    },
    /**
     * ajax 开始/结束时的状态处理
     * 例如单击按钮后，在开始时禁用按钮，结束时恢复它；
     * 再例如，在 ajax 开始时启用页面动画，结束时关闭页面动画。
     * @param  {Object}  waiting - 来自于 `data.waiting` 参数，参数内容可根据 `fnWaiting` 具体的处理来设置。例如这里为：
     * `{$btn:$btn, text:"请求中..", defaultText: "提交"}`
     * @param  {Number} time - 存在值时在 ajax 结束调用，值为 ajax 消耗的时间；省略时在 ajax 开始调用
     * @return {void}
     */
    fnWaiting(waiting, time) {
        if ('development' === process.env.NODE_ENV && time) {
           console.trace('ajax 请求消耗时间：', time);
        }

        // 示例：根据 time 区分 ajax 开始与结束，分别做不同的处理
        // 这里以处理按钮状态为例，waiting 参数则为关键: {$btn, text, defaultText}
        if (!waiting || !waiting.$btn || !waiting.$btn.length) {
            return;
        }

        if (!time) {
            waiting.$btn.data('defaultText', waiting.$btn.html())
                .html(waiting.text || '<i class="fa fa-spinner fa-spin"></i> 请求中...')
                .addClass('disabled').prop('disabled', true);
        } else {
            setTimeout(function () { 
                // 连续提交延时处理，两次连续提交不能超过 200 ms
                waiting.$btn.html(waiting.defaultText || waiting.$btn.data('defaultText'))
                    .removeClass('disabled').prop('disabled', false);
            }, 200);
        }
    },
    /**
     * ajax 请求开始前回调方法
     * @param  {Object} config - ajax 请求配置，由于是引用传参，可在这里通过修改它实现 mock 数据等功能
     * @return {void}
     */
    fnBeforeAjax(config) {
        // 示例：增加通用上报参数
        cofig.data = $.extend({}, config.data, {
            username: Cookie.get('userName'),
            now: new Date().getTime()
        });

        return config;
    },
    /**
     * 通用 ajax 请求返回时回调方法
     * 对于基于接口的约定，如这里的示例：以 `code` 为 `200` 认为是成功的数据，否则为出错
     * @param {Object} result - ajax 返回的数据结果
     * @param {Function} callback - 成功回调方法
     * @param {Function} errCallback - 出错回调方法
     * @param {Object} config - ajax 请求参数配置，即 `adm.get/save` 的第一个参数
     */
    fnAjaxDone(result, callback, errCallback, config) {
        const $d = $.Deferred();

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
            this.alert(result.message);
        }

        return $d;
    },
    /**
     * ajax 失败回调方法，一般为 30x、40x、50x 或返回格式不对、网络中断等
     * @param  {Object} err
     * @param  {Object} config
     * @return {void}
     */
    fnAjaxFail(err, config) {
        if (0 === err.status) {
            this.alert('登录超时').on('hidden.modal.bs', () => {
                window.location.reload();
            });
        } else if (config.errAlert || undefined === config.errAlert && this.errAlert) {
            // errAlert = false 时禁止 40x/50x 等错误的全局提示，可全局禁止，或本次禁止
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

const param = {
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

```javascript
const param = {
    url: '/rest/user/list',
    cache: 'sessionStorage', // 从 url 读取到了数据时，也缓存到 `sessionStorage`
    fromCache: 'sessionStorage', //优先从 `sessionStorage` 获取数据
    cacheName: 'userlist' //不写则使用 url 格式化：`rest.user.list`
};

adm.get(param).then((result) => {}, (err) => {});
```

缓存到内存示例，适合单页应用

```javascript
const param = {
    url: '/rest/user/list',
    cache: true, // 从 url 读取到了数据时，也缓存到内存中
    fromCache: true, //优先从内存获取数据
    cacheName: 'userlist' //不写则使用 url 格式化：`rest.user.list`
};

adm.get(param).then((result) => {}, (err) => {});
```

缓存到 `localStorage` 示例，适合永远不会的数据

```javascript
const data = {typeId: 2};
const param = {
    data,
    url: '/rest/user/list',
    cache: 'localStorage',
    fromCache: 'localStorage',
    cacheName: 'userlist_type_' + data.typeId // 以请求参数区分
};

adm.get(param).then((result) => {}, (err) => {});

// 从 localStorage 中删除
adm.delete(param.url, 'localStorage');
```

### 使用示例三：

* adm.get/adm.save
* `waiting` 参数，按钮状态处理
* `data` 参数

```javascript
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

## 使用示例

- `adm.getJSON/adm.post` API 示例

`adm.getJSON` 和 `adm.post` API 分别是 `adm.get` 和 `adm.save` 的简写版，用于一般的 ajax 请求。

`adm.getJSON` API 示例：

```javascript
const url = '/rest/xxx';

// thenable 风格回调
adm.getJSON(url).then((result) => {
    console.log(result);
}, (err) => {
    console.log(err);
});

// thenable 风格回调，带 data 参数
const data = {id: 123}
adm.getJSON(url, data).then()...

// callback 风格回调
adm.getJSON(url, function(result){}, function(err) {});

// callback 风格回调，带 data 参数
adm.getJSON(url, data, function(result){}, function(err) {});

```

`adm.post` API 示例：

```javascript
const url = '/rest/yyy';
const data = {id: 333};

adm.post(url, data, function(result){}, function(err) {});
// 或 thenable 风格
adm.post(url, data)
    .then(function(result){}, function(err) {}))
    .then()...
```
