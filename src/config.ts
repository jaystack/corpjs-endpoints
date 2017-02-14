import { Config, loaders } from 'corpjs-config'

export let config

new Config()
  .add(config => loaders.require({ path: '../config/default.json' }))
  .end((err, conf) => { config = conf })