import 'mocha'
import System, { Component } from 'corpjs-system'
import EndpointComponent, { EndpointsConfig } from '../src'

interface Config { systemEndpoints: string | EndpointsConfig }

describe('corpjs-endpoints', () => {

})

function createSystem(config): Promise<System> {
  return new Promise((resolve, reject) => {
    new System()
      .configure(config())
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