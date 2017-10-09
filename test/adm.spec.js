import './helpers/_helper';

function cacheTest(cfg) {
    const {url, cache: type} = cfg;

    it(`ajax get(缓存到 ${type}，然后读写删测试): ${url}`, function (next) {
        return adm.get(cfg).done((result) => {
            expect(result.code).to.be.equal(200);
        }).then(() => {
            let cache = adm.get(url, type);

            expect(cache.code).to.be.equal(200);

            if (cfg.expires && cfg.cache) {
                // expires 有效期测试
                setTimeout(function () {
                    // 有效期内，可以读取到
                    cache = adm.get(url, type);
                    expect(cache.code).to.be.equal(200);

                    setTimeout(function () {
                        // 超过有效期，读取不到
                        cache = adm.get(url, type);
                        expect(cache).to.be.equal(undefined);
                        next();
                    }, 200);
                }, cfg.expires - 100);
            } else {
                adm.delete(url, type);
                cache = adm.get(url, type);
                expect(cache).to.be.equal(undefined);
                next();
            }
        });
    });
}

describe('test: ajax 测试', function () {
    before(function () {
        adm.clear();
    });

    describe('测试 adm.get', function () {
        const url = '/rest/user';

        it(`ajax get: ${url}`, function (next) {
            adm.get({
                url
            }).done((result) => {
                expect(result.code).to.be.equal(200);

                next();
            });
        });

        it(`ajax getJSON: ${url}`, function (next) {
            adm.getJSON(url, (result) => {
                expect(result.code).to.be.equal(200);

                next();
            });
        });

        it(`ajax post: ${url}`, function (next) {
            adm.post(url, {}, (result) => {
                expect(result.code).to.be.equal(200);

                next();
            });
        });

        cacheTest({url, cache: 'memory'});
        cacheTest({url, cache: 'memory', expires: 1000});
        cacheTest({url, cache: 'sessionStorage'});
        cacheTest({url, cache: 'localStorage'});
    });
});
