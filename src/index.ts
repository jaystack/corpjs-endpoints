import { readJson, watchFile, unwatchFile } from 'fs-promise'
import System, { Component, ComponentCallback } from 'corpjs-system'
import { CorpjsEndpoints, EndpointsConfig, Endpoint, Endpoints, Host } from './types'

export * from './types'

export default function (): Component<CorpjsEndpoints> {

  let config: EndpointsConfig

  return {

    start(deps, cb: ComponentCallback<CorpjsEndpoints>) {
      config = deps.config
      start(config)
        .then(corpjsEndpoints => cb(null, corpjsEndpoints))
        .catch(err => cb(err, null))
    },

    stop(cb: ComponentCallback<void>) {
      const endpointsFilePath = getEndpointsFilePath(config)
      unwatchFile(endpointsFilePath)
      cb()
    }

  } as Component<CorpjsEndpoints>
}

async function start(config: any = {}): Promise<CorpjsEndpoints> {
  const endpointsFilePath = getEndpointsFilePath(config)
  let endpoints: Endpoints = await read(endpointsFilePath)
  watchFile(endpointsFilePath, async () => endpoints = await read(endpointsFilePath) || {})
  return {
    getServiceEndpoint: alias => getServiceEndpoint(endpoints, alias, config.normalize),
    getServiceAddress: alias => getServiceAddress(endpoints, alias, config.normalize)
  }
}

async function read(path) {
  try {
    return await readJson(path)
  } catch (err) {
    return {}
  }
}

function getEndpointsFilePath(config): string {
  const { systemEndpoints } = config
  if (!systemEndpoints) return './endpoints.json'
  return typeof systemEndpoints === 'string' ? systemEndpoints : systemEndpoints.endpointsFilePath
}

function getServiceEndpoint(endpoints: Endpoints, alias: string, normalize = true): Endpoint {
  return normalize ? normalizeEndpoint(endpoints.currentHost, getAlias(endpoints, alias)) : getAlias(endpoints, alias)
}

function getServiceAddress(endpoints, alias: string, normalize = true): string {
  return join(getServiceEndpoint(endpoints, alias, normalize))
}

// function get(endpoints, alias): Endpoint {
//   return ((endpoints || {}).hosts || {})[alias] || resolveAddress(alias)
// }

export function getAlias(endpoints, alias): Endpoint {
  const hosts = ((endpoints || {}).hosts || undefined)
  const aliasHosts = hosts ? (hosts.filter(host => host.alias === alias)) : undefined
  return aliasHosts && aliasHosts[0] && aliasHosts[0].endpoint || resolveAddress(alias)
}

function resolveAddress(address: string): Endpoint {
  const [host, port] = address.split(':').filter(_ => _)
  return { host, port }
}

function join(endpoint: Endpoint): string {
  const {host, port} = endpoint
  return [host, port].filter(_ => _).join(':')
}

function normalizeEndpoint(currentHost: string, endpoint: Endpoint): Endpoint {
  if (currentHost === endpoint.host) {
    return { host: 'localhost', port: endpoint.port }
  } else {
    return endpoint
  }
}