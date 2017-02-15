"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs_promise_1 = require("fs-promise");
function default_1() {
    let config;
    return {
        start(deps, cb) {
            config = deps.config;
            start(config)
                .then(corpjsEndpoints => cb(null, corpjsEndpoints))
                .catch(err => cb(err, null));
        },
        stop(cb) {
            const endpointsFilePath = getEndpointsFilePath(config);
            fs_promise_1.unwatchFile(endpointsFilePath);
            cb();
        }
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function start(config = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpointsFilePath = getEndpointsFilePath(config);
        let endpoints = yield read(endpointsFilePath);
        fs_promise_1.watchFile(endpointsFilePath, () => __awaiter(this, void 0, void 0, function* () { return endpoints = (yield read(endpointsFilePath)) || {}; }));
        return {
            getServiceEndpoint: alias => getServiceEndpoint(endpoints, alias, config.normalize),
            getServiceAddress: alias => getServiceAddress(endpoints, alias, config.normalize)
        };
    });
}
function read(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fs_promise_1.readJson(path);
        }
        catch (err) {
            return {};
        }
    });
}
function getEndpointsFilePath(config) {
    const { systemEndpoints } = config;
    if (!systemEndpoints)
        return './endpoints.json';
    return typeof systemEndpoints === 'string' ? systemEndpoints : systemEndpoints.endpointsFilePath;
}
function getServiceEndpoint(endpoints, alias, normalize = true) {
    return normalize ? normalizeEndpoint(endpoints.currentHost, getAlias(endpoints, alias)) : getAlias(endpoints, alias);
}
function getServiceAddress(endpoints, alias, normalize = true) {
    return join(getServiceEndpoint(endpoints, alias, normalize));
}
// function get(endpoints, alias): Endpoint {
//   return ((endpoints || {}).hosts || {})[alias] || resolveAddress(alias)
// }
function getAlias(endpoints, alias) {
    const hosts = ((endpoints || {}).hosts || undefined);
    const aliasHosts = hosts ? (hosts.filter(host => host.alias === alias)) : undefined;
    return aliasHosts && aliasHosts[0] && aliasHosts[0].endpoint || resolveAddress(alias);
}
exports.getAlias = getAlias;
function resolveAddress(address) {
    const [host, port] = address.split(':').filter(_ => _);
    return { host, port };
}
function join(endpoint) {
    const { host, port } = endpoint;
    return [host, port].filter(_ => _).join(':');
}
function normalizeEndpoint(currentHost, endpoint) {
    if (currentHost === endpoint.host) {
        return { host: 'localhost', port: endpoint.port };
    }
    else {
        return endpoint;
    }
}
