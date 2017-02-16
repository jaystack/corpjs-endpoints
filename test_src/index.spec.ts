import 'mocha'
import * as assert from 'assert'
import { writeJson, writeFile, truncate } from 'fs-promise'
import System from 'corpjs-system'
import EndpointComponent, { EndpointsConfig, CorpjsEndpoints, Endpoints } from '../src'

const testEndpoints = {
  "currentHost": "1.2.3.4",
  "hosts": [
    {
      "alias": "yee",
      "endpoint": {
        "host": "localhost",
        "port": 3000
      }
    },
    {
      "alias": "sameHost",
      "endpoint": {
        "host": "1.2.3.4",
        "port": 3001
      }
    },
    {
      "alias": "differentHost",
      "endpoint": {
        "host": "10.20.30.40",
        "port": 3002
      }
    }
  ]
}

const changedEndpoints = {
  ...testEndpoints,
  hosts: testEndpoints.hosts.map(
    host => host.alias === 'yee' ?
      ({ ...host, endpoint: { port: host.endpoint.port, host: '1.1.1.1' } }) :
      host
  )
}

const ENDPOINTS_FILE_PATH = './test/temp-endpoints.json'

describe('corpjs-endpoints', () => {

  let system

  it('it misses endpoints file on default path', async () => {
    try {
      await createSystem({})
    } catch (err) {
      assert.throws(() => { throw err }, /ENOENT/)
    }
  })

  beforeEach(async () => {
    if (system) await system.stop()
  })

  it('for an empty json it should return the value of alias as host addres', async () => {
    await createEndpointsFile()
    system = createSystem({ systemEndpoints: ENDPOINTS_FILE_PATH })
    const {endpoints} = await system.start()
    assert.equal(endpoints.getServiceAddress('yee'), 'yee')
  })

  it('for an empty json it should return an endpoint with .host = the value of alias and .port = undefined', async () => {
    await createEndpointsFile()
    system = createSystem({ systemEndpoints: ENDPOINTS_FILE_PATH })
    const {endpoints} = await system.start()
    assert.deepStrictEqual(endpoints.getServiceEndpoint('yee'), { host: 'yee', port: undefined })
  })

  it('it should resolve endpoint address', async () => {
    await createEndpointsFile(testEndpoints)
    system = createSystem({ systemEndpoints: ENDPOINTS_FILE_PATH })
    const {endpoints} = await system.start()
    assert.equal(endpoints.getServiceAddress('yee'), 'localhost:3000')
  })

  it('it should resolve endpoint', async () => {
    await createEndpointsFile(testEndpoints)
    system = createSystem({ systemEndpoints: ENDPOINTS_FILE_PATH })
    const {endpoints} = await system.start()
    assert.deepStrictEqual(endpoints.getServiceEndpoint('yee'), { host: 'localhost', port: 3000 })
  })

  it('it should resolve endpoint of the same host as localhost', async () => {
    await createEndpointsFile(testEndpoints)
    system = createSystem({ systemEndpoints: ENDPOINTS_FILE_PATH })
    const {endpoints} = await system.start()
    assert.equal(testEndpoints.currentHost, '1.2.3.4')
    assert.equal(testEndpoints.hosts[1].endpoint.host, '1.2.3.4')
    assert.deepStrictEqual(endpoints.getServiceEndpoint('sameHost'), { host: 'localhost', port: 3001 })
  })

  it('it should not resolve endpoint of a different host as localhost', async () => {
    await createEndpointsFile(testEndpoints)
    system = createSystem({ systemEndpoints: ENDPOINTS_FILE_PATH })
    const {endpoints} = await system.start()
    assert.equal(testEndpoints.currentHost, '1.2.3.4')
    assert.equal(testEndpoints.hosts[2].endpoint.host, '10.20.30.40')
    assert.deepStrictEqual(endpoints.getServiceEndpoint('differentHost'), { host: '10.20.30.40', port: 3002 })
  })

  it('it should watch file', done => {
    (async () => {
      await createEndpointsFile(testEndpoints)
      system = createSystem({ systemEndpoints: ENDPOINTS_FILE_PATH })
        .on('restart', ({endpoints}) => {
          try {
            assert.deepStrictEqual(endpoints.getServiceEndpoint('yee'), { host: '1.1.1.1', port: 3000 })
            done()
          } catch (err) {
            done(err)
          }
        })
      
      await system.start()
      await createEndpointsFile(changedEndpoints)
    })()
  })

  after(async () => {
    await system.stop()
  })

})

function createSystem(conf): System {
  return new System()
    .add('config', config(conf))
    .add('endpoints', EndpointComponent()).dependsOn('config')
}

async function createEndpointsFile(content?) {
  if (content) await writeJson(ENDPOINTS_FILE_PATH, content)
  else await writeFile(ENDPOINTS_FILE_PATH, '')
  return content
}

function config(conf): System.Component {
  return {
    async start() { return conf }
  }
}