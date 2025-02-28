const { Authflow, createFileSystemCache } = require('prismarine-auth')

const cacher = createFileSystemCache('./', Authflow.CACHE_NAMES)
const authflow = new Authflow('apple', cacher)
authflow.login().then(console.log)
