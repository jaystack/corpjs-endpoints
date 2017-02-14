"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require("mocha");
const assert = require("assert");
const corpjs_system_1 = require("corpjs-system");
const src_1 = require("../src");
describe('corpjs-endpoints', () => {
    it('it misses system-endpoints.json on default path', () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield createSystem({});
        }
        catch (err) {
            assert.throws(() => { throw err; }, /ENOENT/);
        }
    }));
    it('it should return the alias', () => __awaiter(this, void 0, void 0, function* () {
        const { endpoints } = yield createSystem({ systemEndpoints: "test_src/empty-endpoints.json" });
        assert.equal(endpoints.getServiceAddress('yee'), 'yee');
    }));
    it('it should return the alias endpoint', () => __awaiter(this, void 0, void 0, function* () {
        const { endpoints } = yield createSystem({ systemEndpoints: "test_src/empty-endpoints.json" });
        assert.deepStrictEqual(endpoints.getServiceEndpoint('yee'), { host: 'yee', port: undefined });
    }));
    it('it should resolve endpoint address', () => __awaiter(this, void 0, void 0, function* () {
        const { endpoints } = yield createSystem({ systemEndpoints: "test_src/endpoints.json" });
        assert.equal(endpoints.getServiceAddress('yee'), 'localhost:3000');
    }));
    it('it should resolve endpoint', () => __awaiter(this, void 0, void 0, function* () {
        const { endpoints } = yield createSystem({ systemEndpoints: "test_src/endpoints.json" });
        assert.deepStrictEqual(endpoints.getServiceEndpoint('yee'), { host: 'localhost', port: 3000 });
    }));
});
function createSystem(conf) {
    return new Promise((resolve, reject) => {
        new corpjs_system_1.default()
            .add('config', config(conf))
            .add('endpoints', src_1.default()).dependsOn('config')
            .start((err, system) => {
            if (err)
                return reject(err);
            resolve(system);
        });
    });
}
function config(conf) {
    return { start(done) { done(null, conf); } };
}
