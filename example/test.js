const adm = window.adm;

function clear() {
    localStorage.clear();
    sessionStorage.clear();
}

function showMsg() {
    let i = 0, len, msg = '';

    for (len = arguments.length; i < len; i++) {
        if (typeof arguments[i] !== 'string') {
            arguments[i] = '<code>' + JSON.stringify(arguments[i]) + '</code>';
        }
        if (0 === i) {
            arguments[i] = '<b>' + arguments[i] + '</b>';
        }

        msg += ' ' + arguments[i];
    }

    $(`<p>${msg}</p>`).appendTo('body');
}

function eqeq(v1, v2) {
    return JSON.stringify(v1) === JSON.stringify(v2) ?
        '<font color="green">true</font>' :
        '<font color="red">false</font>';
}

function doRun() {
    clear();

    // 普通的 ajax 请求
    adm.get({
        url: '/rest/user'
    }).done(function (result) {
        console.log(result.value);
        showMsg('普通的 ajax 请求(/rest/user): ', result.value);
    }).then(function () {
        // code !== 200 的 ajax 请求
        return adm.get({
            url: '/rest/user/xxx'
        });
    }).then(function (result) {}, function (result) {
        return showMsg('code !== 200 的 ajax 请求(/rest/user/xxx): ', result);
    }).then(function () {
        // 缓存到内存
        return adm.get({
            url: '/rest/user',
            cache: true,
            fromCache: true
        });
    }).then(function (result) {
        // 从内存读取
        const cache = adm.get('/rest/user');

        console.log(result);

        showMsg('从内存读取：', cache);
        showMsg('从内存读取与 url 获取值一致：', eqeq(result, cache));
    }).then(function () {
        // 缓存到 sessionStorage
        return adm.get({
            url: '/rest/user',
            cache: 'sessionStorage'
        });
    }).then(function (result) {
        const cache = adm.get('/rest/user', 'sessionStorage');

        console.log(result);

        showMsg('从 sessionStorage 读取：', cache);
        showMsg('从 sessionStorage 读取与 url 获取值一致：', eqeq(result, cache));
    }).then(function () {
        // 缓存到 localStorage
        return adm.get({
            url: '/rest/user',
            cache: 'localStorage'
        });
    }).then(function (result) {
        const cache = adm.get('/rest/user', 'localStorage');

        console.log(result);

        showMsg('从 localStorage 读取：', cache);
        showMsg('从 localStorage 读取与 url 获取值一致：', eqeq(result, cache));
    }).then(function () {
        // 普通的缓存数据到 sessionStorage
        const data = {a: 1, b: 2};

        adm.save('testdata', data, {cache: 'sessionStorage'});

        const cache = adm.get('testdata', 'sessionStorage');

        showMsg('普通的缓存数据到 sessionStorage，读取值：', cache, eqeq(cache, data));
    }).then(function () {
        return new Promise(function (rs, rj) {
            // 普通的缓存数据到 sessionStorage
            const data = {a: 1, b: 2};

            adm.save('testdata_expires', data, {cache: 'sessionStorage', expires: 1000});

            let cache = adm.get('testdata_expires', 'sessionStorage');

            showMsg('普通的缓存数据到 sessionStorage(expires=1000)，读取值：', cache, eqeq(cache, data));

            setTimeout(function () {
                cache = adm.get('testdata_expires', 'sessionStorage');
                showMsg('普通的缓存数据到 sessionStorage(expires=1000)，2 s 后读取值：', cache, eqeq(cache, undefined));

                rs();
            }, 2000);
        });
    }).then(function () {
        return new Promise(function (rs, rj) {
            // 普通的缓存数据到 sessionStorage
            const data = {a: 1, b: 2};

            adm.save('testdata_expires_date', data, {
                cache: 'sessionStorage',
                expires: new Date(new Date().getTime() + 1000)
            });

            let cache = adm.get('testdata_expires_date', 'sessionStorage');

            showMsg('普通的缓存数据到 sessionStorage(expires为Date类型，1s后过期)，读取值：', cache, eqeq(cache, data));

            setTimeout(function () {
                cache = adm.get('testdata_expires_date', 'sessionStorage');
                showMsg('普通的缓存数据到 sessionStorage(expires为Date类型，1s后过期)，2 s 后读取值：', cache, eqeq(cache, undefined));

                rs();
            }, 2000);
        });
    });
}

doRun();