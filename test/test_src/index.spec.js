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
const fs_1 = require("fs");
const corpjs_system_1 = require("corpjs-system");
const src_1 = require("../src");
const emptyTestEndpointsJsonFile = "test_src/empty-endpoints.json";
const testEndpointsJsonFile = "test_src/endpoints.json";
describe('corpjs-endpoints', () => {
    let endpointsJson;
    before((done) => {
        readJson(testEndpointsJsonFile)
            .then(jsonData => {
            endpointsJson = jsonData;
            return done();
        })
            .catch(err => done(err));
    });
    it('it misses system-endpoints.json on default path', () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield createSystem({});
        }
        catch (err) {
            assert.throws(() => { throw err; }, /ENOENT/);
        }
    }));
    it('for an empty json it should return the value of alias as host addres', () => __awaiter(this, void 0, void 0, function* () {
        const { endpoints } = yield createSystem({ systemEndpoints: emptyTestEndpointsJsonFile });
        assert.equal(endpoints.getServiceAddress('yee'), 'yee');
    }));
    it('for an empty json it should return an endpoint with .host = the value of alias and .port = undefined', () => __awaiter(this, void 0, void 0, function* () {
        const { endpoints } = yield createSystem({ systemEndpoints: emptyTestEndpointsJsonFile });
        assert.deepStrictEqual(endpoints.getServiceEndpoint('yee'), { host: 'yee', port: undefined });
    }));
    it('it should resolve endpoint address', () => __awaiter(this, void 0, void 0, function* () {
        const { endpoints } = yield createSystem({ systemEndpoints: testEndpointsJsonFile });
        assert.equal(endpoints.getServiceAddress('yee'), 'localhost:3000');
    }));
    it('it should resolve endpoint', () => __awaiter(this, void 0, void 0, function* () {
        const { endpoints } = yield createSystem({ systemEndpoints: testEndpointsJsonFile });
        assert.deepStrictEqual(endpoints.getServiceEndpoint('yee'), { host: 'localhost', port: 3000 });
    }));
    it('it should resolve endpoint of the same host as localhost', () => __awaiter(this, void 0, void 0, function* () {
        const { endpoints } = yield createSystem({ systemEndpoints: testEndpointsJsonFile });
        assert.equal(endpointsJson.currentHost, '1.2.3.4');
        assert.equal(endpointsJson.hosts[1].endpoint.host, '1.2.3.4');
        assert.deepStrictEqual(endpoints.getServiceEndpoint('sameHost'), { host: 'localhost', port: 3001 });
    }));
    it('it should not resolve endpoint of a different host as localhost', () => __awaiter(this, void 0, void 0, function* () {
        const { endpoints } = yield createSystem({ systemEndpoints: testEndpointsJsonFile });
        assert.equal(endpointsJson.currentHost, '1.2.3.4');
        assert.equal(endpointsJson.hosts[2].endpoint.host, '10.20.30.40');
        assert.deepStrictEqual(endpoints.getServiceEndpoint('differentHost'), { host: '10.20.30.40', port: 3002 });
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
function readJson(jsonFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.readFile(jsonFileName, "utf-8", (err, data) => {
                if (err)
                    return reject(err);
                let jsonData;
                try {
                    jsonData = JSON.parse(data);
                }
                catch (error) {
                    return reject(error);
                }
                return resolve(jsonData);
            });
        });
    });
}
