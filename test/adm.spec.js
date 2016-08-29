import './helpers/_helper';

function cacheTest(url, type) {
    it(`ajax get(缓存到 ${type}，然后读写删测试): ${url}`, function () {
        return adm.get({
            url,
            cache: type
        }).done((result) => {
            expect(result.code).to.be.equal(200);
        }).then(() => {
            let cache = adm.get(url, type);

            expect(cache.code).to.be.equal(200);

            adm.delete(url, type);
            cache = adm.get(url);
            expect(cache).to.be.equal(undefined);
        });
    });
}

describe('test: ajax 测试', function () {
    before(function () {
        adm.clear();
    });

    describe('测试 adm.get', function () {
        let url = '/rest/user';

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
            adm.getJSON(url, {}, (result) => {
                expect(result.code).to.be.equal(200);

                next();
            });
        });

        cacheTest(url, 'memory');
        cacheTest(url, 'sessionStorage');
        cacheTest(url, 'localStorage');
    });
});
