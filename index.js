const card = require('./card')
const binding = require('./binding')
const fixedString = require('./fixedString')
const slices = require('./slices')
const schema = require('./schema')

const directives = { card, binding, fixedString, slices }
module.exports = { directives, schema }
