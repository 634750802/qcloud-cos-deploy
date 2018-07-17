# QCloud COS Deploy

## Usage

```bash

npm i qcloud-cos-deploy

```

### CLI

```json
// package.json
{
    //...
    "scripts": {
        "deploy": "qcloud-cos-deploy dist --bucket tdu-static-1255927758 --region ap-guangzhou --secret-id xxx --secret-key xxx -i index\\.html"
    }
}

```

```bash
npm run deploy
```

### Code
// any.js

const deploy = require('qcloud-cos-deploy')

deploy({
    region: '',
    bucket: '',
    secretId: '',
    secretKey: '',
    ignore: ''
})

###