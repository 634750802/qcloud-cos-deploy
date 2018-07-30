const path = require('path')
const fs = require('fs')
const ora = require('ora')
const COS = require('cos-nodejs-sdk-v5')

module.exports = function ({bucket, region, secretId, secretKey, ignore, context, dir, force}) {

  let spinner = ora('Preparing Upload...').start()
  let total = 0
  let done = 0
  const uploadedFiles = []

  const cos = new COS({
    SecretId: secretId,
    SecretKey: secretKey
  })

  const common = {
    Region: region,
    Bucket: bucket
  }

  async function upload (filename, file, contentLength) {
    try {
      await head(filename)
      if (!force) {
        return
      }
    } catch (e) {}
    return new Promise((resolve, reject) => {
      cos.putObject({
        ...common,
        Key: filename,
        ContentLength: contentLength,
        Body: file
      }, function (err) {
        if (err) {
          reject(new Error('upload error: ' + file.path))
        } else {
          resolve()
          done += 1
          spinner.text = `[${done} / ${total}] ${file.path} uploaded.`
        }
      })
    })
  }

  async function uploadDirectory (
    home, ignoreRegex, context = '') {
    const files = fs.readdirSync(home)
    const promises = []
    for (const file of files) {
      if (ignoreRegex instanceof RegExp && ignoreRegex.test(file)) {
        continue
      }
      const localPath = path.join(home, file)
      const fileStat = fs.statSync(localPath)
      const key = path.join(context, file)
      if (fileStat.isDirectory()) {
        promises.push(uploadDirectory(localPath, ignoreRegex, key))
      } else if (fileStat.isFile()) {
        total += 1
        promises.push(
          upload(key, fs.createReadStream(localPath), fileStat.size))
        uploadedFiles.push(
          key)
      }
    }
    return Promise.all(promises)
      .then(() => {
        spinner.succeed(
          `[done]Uploaded ${home}`)
        spinner = ora('Preparing upload...').start()
      })
      .catch(err => {
        spinner.fail(`[error] ${err.message}`)
      })
  }

  async function head (key) {
    const params = {
      ...common,
      Key: key
    }
    return new Promise((resolve, reject) => {
      cos.headObject(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  uploadDirectory(dir, new RegExp(ignore), context)
    .then(() => {
      spinner.succeed(`[done] ${done} / ${total} files.`)
    })
    .then(async () => {
      spinner = ora('Testing ...').start()
      let i = 0
      for (const key of uploadedFiles) {
        spinner.text = `[ ${++i} / ${uploadedFiles.length} ] Testing https://${bucket}.cos.${region}.myqcloud.com/${key} ...`
        await head(key)
      }
      spinner.succeed('Test done')

    })
    .catch(err => {
      spinner.fail("Test failed: " + err.message)
    })
}
