import { readJson, watchFile, unwatchFile } from 'fs-promise'
import System from 'corpjs-system'
import { Component, Callback } from 'corpjs-system'
import { CorpjsEndpoints, EndpointsConfig, Endpoint, Endpoints } from './types'

export default function () {

  let config: EndpointsConfig

  return {

    start({ conf }, cb: Callback<CorpjsEndpoints>) {
      config = conf
      start(config)
        .then(corpjsEndpoints => cb(null, corpjsEndpoints))
        .catch(err => cb(err, null))
    },

    stop(cb: Callback<void>) {
      const endpointsFilePath = getEndpointsFilePath(config)
      unwatchFile(endpointsFilePath)
    }

  } as Component<CorpjsEndpoints>
}

async function start(config): Promise<CorpjsEndpoints> {
  const endpointsFilePath = getEndpointsFilePath(config)
  let endpoints: Endpoints = await readJson(endpointsFilePath) || {}
  watchFile(endpointsFilePath, async () => endpoints = await readJson(endpointsFilePath) || {})
  return {
    getServiceEndpoint: alias => getServiceEndpoint(endpoints, alias, config),
    getServiceAddress: alias => getServiceAddress(endpoints, alias, config)
  }
}

function getEndpointsFilePath(config): string {
  const { endpointsConfig } = config
  if (!endpointsConfig) return './system-endpoints.json'
  return typeof endpointsConfig === 'string' ? endpointsConfig : endpointsConfig.endpointsFilePath
}

function getServiceEndpoint(endpoints: Endpoints, alias: string, normalize = true): Endpoint {
  return normalize ? normalizeEndpoint(endpoints.currentHost, get(endpoints, alias)) : get(endpoints, alias)
}

function getServiceAddress(endpoints, alias: string, {normalize = true}): string {
  return join(getServiceEndpoint(endpoints, alias, normalize))
}

function get(endpoints, alias): Endpoint {
  return endpoints.hosts[alias] || resolveAddress(alias)
}

function resolveAddress(address: string): Endpoint {
  const [host, port] = address.split(':').filter(_ => _)
  return { host, port }
}

function join({host, port}: Endpoint): string {
  return `${host}:${port}`
}

function normalizeEndpoint(currentHost: string, endpoint: Endpoint): Endpoint {
  if (!currentHost) return endpoint
  return { host: currentHost, port: endpoint.port }
}