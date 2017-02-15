import 'mocha'
import * as assert from 'assert'
import { getAlias } from '../src'

describe('getAlias', () => {

  it('it should return host.endpoint if alias matches host.alias', () => {
    const endpoints = {
      currentHost: "localhost",
      hosts: [
        {
          alias: "localhost:3000",
          endpoint: {
            host: "localhost",
            port: "3000"
          }
        }
      ]
    }​​​​​​
    const expectedEndpoint = {
      host: "localhost",
      port: "3000"
    }
    assert.deepStrictEqual(getAlias(endpoints, endpoints.hosts[0].alias), expectedEndpoint)
  })

  it('it should return alias value as host and porst as undefined if alias is not matched', () => {
    const endpoints = {
      currentHost: "localhost",
      hosts: [
        {
          alias: "localhost:3000",
          endpoint: {
            host: "localhost",
            port: "3000"
          }
        }
      ]
    }​​​​​​
    const expectedEndpoint = {
      host: "notExistingAlias",
      port: undefined
    }
    assert.deepStrictEqual(getAlias(endpoints, "notExistingAlias"), expectedEndpoint)
  })

})