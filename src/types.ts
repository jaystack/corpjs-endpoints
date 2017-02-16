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