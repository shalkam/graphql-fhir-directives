const card = require('./card')
const binding = require('./binding')
const fixedString = require('./fixedString')
const schema = require('./schema')

const directives = { card, binding, fixedString }
module.exports = { directives, schema }
