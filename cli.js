#!/usr/bin/env node

const program = require('commander')

const p = program.version('0.0.1', '-v, --version')
  .usage('[options] <dir>')
  .option('--bucket <bucket>', 'Bucket name')
  .option('--region <region>', 'Bucket region')
  .option('--secret-id <api-key>', 'API Key')
  .option('--secret-key <api-secret>', 'API Secret')
  .option('-i, --ignore <regexp>', 'Ignored files pattern(regexp)')
  .option('-c, --context <path>', 'Context path on qcloud', '')
  .parse(process.argv)

const {bucket, region, secretId, secretKey, ignore, context} = p
const dir = p.args[0]

require('./index')({bucket, region, secretId, secretKey, ignore, context, dir})
