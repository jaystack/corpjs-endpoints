export interface EndpointsConfig {
  endpointsFilePath: string
  normalize: boolean
}

export interface Endpoint {
  host: string
  port: string | number
}

export interface Endpoints {
  currentHost: string
  hosts: {
    [alias: string]: Endpoint
  }
}

export interface CorpjsEndpoints {
  getServiceEndpoint(alias: string): Endpoint
  getServiceAddress(alias: string): string
}