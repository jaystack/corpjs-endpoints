import { readJson, watch, FSWatcher } from 'fs-promise'
import System from 'corpjs-system'

export namespace Endpoints {

  export interface EndpointsConfig {
    endpointsFilePath: string
    normalize: boolean
  }

  export interface Endpoint {
    host: string
    port: string | number
  }

  export interface Host {
    alias: string
    endpoint: Endpoint
  }

  export interface Endpoints {
    currentHost?: string
    hosts?: Host[]
  }

  export interface CorpjsEndpoints {
    getServiceEndpoint(alias: string): Endpoint
    getServiceAddress(alias: string): string
  }
}

export function Endpoints(): System.Component {

  let watcher: FSWatcher

  return {

    async start({config}: { config: any }, restart, stop) {
      const endpointsFilePath = getEndpointsFilePath(config)
      const endpoints = await read(endpointsFilePath)
      watcher = watch(endpointsFilePath, restart)
      watcher.on('error', stop)
      return {
        getServiceEndpoint: alias => getServiceEndpoint(endpoints, alias, config.normalize),
        getServiceAddress: alias => getServiceAddress(endpoints, alias, config.normalize)
      }
    },

    async stop() {
      if (watcher) watcher.close()
    }

  } as System.Component
}

export default Endpoints

async function read(path): Promise<Endpoints.Endpoints> {
  try {
    return await readJson(path)
  } catch (err) {
    return {}
  }
}

function getEndpointsFilePath(config): string {
  const { endpointsFilePath } = config
  if (!endpointsFilePath) return './endpoints.json'
  return typeof endpointsFilePath === 'string' ? endpointsFilePath : endpointsFilePath.endpointsFilePath
}

function getServiceEndpoint(endpoints: Endpoints.Endpoints, alias: string, normalize = true): Endpoints.Endpoint {
  return normalize ? normalizeEndpoint(endpoints.currentHost, getByAlias(endpoints, alias)) : getByAlias(endpoints, alias)
}

function getServiceAddress(endpoints, alias: string, normalize = true): string {
  return join(getServiceEndpoint(endpoints, alias, normalize))
}

export function getByAlias(endpoints: Endpoints.Endpoints = {}, alias): Endpoints.Endpoint {
  const hosts = endpoints.hosts || []
  const host = hosts.find(host => host.alias === alias)
  return host && host.endpoint ? host.endpoint : resolveAddress(alias)
}

function resolveAddress(address: string): Endpoints.Endpoint {
  const [host, port] = address.split(':').filter(_ => _)
  return { host, port }
}

function join(endpoint: Endpoints.Endpoint): string {
  const {host, port} = endpoint
  return [host, port].filter(_ => _).join(':')
}

function normalizeEndpoint(currentHost: string, endpoint: Endpoints.Endpoint): Endpoints.Endpoint {
  return currentHost === endpoint.host ?
    { host: 'localhost', port: endpoint.port } : endpoint
}