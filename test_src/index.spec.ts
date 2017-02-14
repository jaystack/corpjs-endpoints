import 'mocha'
import * as assert from 'assert'
import System, { Component } from 'corpjs-system'
import EndpointComponent, { EndpointsConfig, CorpjsEndpoints } from '../src'

interface Config { systemEndpoints?: string | EndpointsConfig }
interface Components {
  config: Config
  endpoints: CorpjsEndpoints
}

describe('corpjs-endpoints', () => {

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
    const {endpoints} = await createSystem({ systemEndpoints: "test_src/endpoints.json" })
    assert.equal(endpoints.getServiceAddress('yee'), 'localhost:3000')
  })

  it('it should resolve endpoint', async () => {
    const {endpoints} = await createSystem({ systemEndpoints: "test_src/endpoints.json" })
    assert.deepStrictEqual(endpoints.getServiceEndpoint('yee'), { host: 'localhost', port: 3000 })
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