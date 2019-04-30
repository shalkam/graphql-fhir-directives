const path = require('path')
const { importSchema } = require('graphql-import')

const typeDefs = importSchema(path.resolve(__dirname, 'schema.graphql'))

module.exports = typeDefs
