import { readJson, watch, FSWatcher } from 'fs-promise'
import System from 'corpjs-system'
import { CorpjsEndpoints, EndpointsConfig, Endpoint, Endpoints, Host } from './types'

export * from './types'

export default function (): System.Component {

  let watcher: FSWatcher

  return {

    async start({config}: { config: any }, restart) {
      const endpointsFilePath = getEndpointsFilePath(config)
      const endpoints = await read(endpointsFilePath)
      watcher = watch(endpointsFilePath, restart)
      return {
        getServiceEndpoint: alias => getServiceEndpoint(endpoints, alias, config.normalize),
        getServiceAddress: alias => getServiceAddress(endpoints, alias, config.normalize)
      }
    },

    async stop() {
      watcher.close()
    }

  } as System.Component
}

async function read(path): Promise<Endpoints> {
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
  return normalize ? normalizeEndpoint(endpoints.currentHost, getByAlias(endpoints, alias)) : getByAlias(endpoints, alias)
}

function getServiceAddress(endpoints, alias: string, normalize = true): string {
  return join(getServiceEndpoint(endpoints, alias, normalize))
}

export function getByAlias(endpoints: Endpoints = {}, alias): Endpoint {
  const hosts = endpoints.hosts || []
  const host = hosts.find(host => host.alias === alias)
  return host && host.endpoint ? host.endpoint : resolveAddress(alias)
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
  return currentHost === endpoint.host ?
    { host: 'localhost', port: endpoint.port } : endpoint
}