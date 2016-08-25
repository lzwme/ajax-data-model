import './helpers/_helper';

/**
 * 普通的写读删测试
 */
function testSimpleWRD(data, type) {
    let cache;

    before(() => {
        // 存
        adm.save('user_renxia', data, type);
    });

    // 读取 get
    it('读取 adm.get', () => {
        cache = adm.get('user_renxia', type);
        expect(cache).to.be.deep.equal(data);
    });

    // 读取 adm.getAll
    it('读取 adm.getAll', () => {
        cache = adm.getAll(type);
        expect(cache.user_renxia).to.be.deep.equal(data);
    });

    // 删除
    it('删除 adm.delete', () => {
        adm.delete('user_renxia', type);
        cache = adm.get('user_renxia', type);
        expect(cache).to.be.undefined;
    });

    it('删除(正则模糊删除) adm.delete', () => {
        adm.save('user_renxia', data, type);
        cache = adm.get('user_renxia', type);
        expect(cache).to.be.deep.equal(data);

        adm.delete(/user_/i, type);
        cache = adm.get('user_renxia', type);
        expect(cache).to.be.undefined;
    });
}

describe('test1: 无 ajax 的数据读写删测试', function () {
    before(function () {
        adm.clear()
            .clear('sessionStorage')
            .clear('localStorage');
    });

    const data = {
        user: 'renxia',
        site: 'https://lzw.me'
    };

    describe('从内存中写读删',
        () => testSimpleWRD(data));

    describe('从 sessionStorage 中写读删',
        () => testSimpleWRD(data, 'sessionStorage'));

    describe('从 localStorage 中写读删',
        () => testSimpleWRD(data, 'localStorage'));

    describe('测试 adm.get', () => {
        it('读取一个不存在的值', () => {
            expect(adm.get('addxxxdd')).to.be.equal(undefined);
        });
    });
});
