import 'mocha'
import * as assert from 'assert'
import { readFile } from 'fs'
import System, { Component } from 'corpjs-system'
import EndpointComponent, { EndpointsConfig, CorpjsEndpoints, Endpoints } from '../src'

interface Config { systemEndpoints?: string | EndpointsConfig }
interface Components {
  config: Config
  endpoints: CorpjsEndpoints
}

const testEndpointsJsonFile = "test_src/endpoints.json"

describe('corpjs-endpoints', () => {

  let endpointsJson: Endpoints
  before((done) => {
    readJson(testEndpointsJsonFile)
      .then(jsonData => {
        endpointsJson = <Endpoints>jsonData
        return done()
      })
      .catch(err => done(err))
  })

  it('it misses system-endpoints.json on default path', async () => {
    try {
      await createSystem({})
    } catch (err) {
      assert.throws(() => { throw err }, /ENOENT/)
    }
  })

  it('it should return the alias', async () => {
    const {endpoints} = await createSystem({ systemEndpoints: "test_src/empty-endpoints.json" })
    assert.equal(endpoints.getServiceAddress('yee'), 'yee')
  })

  it('it should return the alias endpoint', async () => {
    const {endpoints} = await createSystem({ systemEndpoints: "test_src/empty-endpoints.json" })
    assert.deepStrictEqual(endpoints.getServiceEndpoint('yee'), { host: 'yee', port: undefined })
  })

  it('it should resolve endpoint address', async () => {
    const {endpoints} = await createSystem({ systemEndpoints: testEndpointsJsonFile })
    assert.equal(endpoints.getServiceAddress('yee'), 'localhost:3000')
  })

  it('it should resolve endpoint', async () => {
    const {endpoints} = await createSystem({ systemEndpoints: testEndpointsJsonFile })
    assert.deepStrictEqual(endpoints.getServiceEndpoint('yee'), { host: 'localhost', port: 3000 })
  })

  it('it should resolve endpoint of the same host as localhost', async () => {
    const {endpoints} = await createSystem({ systemEndpoints: testEndpointsJsonFile })
    assert.equal(endpointsJson.currentHost, '1.2.3.4')
    assert.equal(endpointsJson.hosts[1].endpoint.host, '1.2.3.4')
    assert.deepStrictEqual(endpoints.getServiceEndpoint('sameHost'), { host: 'localhost', port: 3001 })
  })

  it('it should not resolve endpoint of a different host as localhost', async () => {
    const {endpoints} = await createSystem({ systemEndpoints: testEndpointsJsonFile })
    assert.equal(endpointsJson.currentHost, '1.2.3.4')
    assert.equal(endpointsJson.hosts[2].endpoint.host, '10.20.30.40')
    assert.deepStrictEqual(endpoints.getServiceEndpoint('differentHost'), { host: '10.20.30.40', port: 3002 })
  })

})

function createSystem(conf): Promise<Components> {
  return new Promise((resolve, reject) => {
    new System<Components>()
      .add('config', config(conf))
      .add('endpoints', EndpointComponent()).dependsOn('config')
      .start((err, system) => {
        if (err) return reject(err)
        resolve(system)
      })
  })
}

function config(conf): Component<Config> {
  return { start(done) { done(null, conf) } }
}


async function readJson(jsonFileName: string) {
  return new Promise((resolve: Function, reject: Function) => {
    readFile(jsonFileName, "utf-8", (err, data) => {
      if (err) return reject(err)
      return resolve(JSON.parse(data));
    })
  })
}