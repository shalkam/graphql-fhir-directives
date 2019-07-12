const { GraphQLScalarType, valueFromAST, getNamedType } = require('graphql')
const { GraphQLError } = require('graphql/error')
const { totalCount, rules } = require('./validations')

class ListWithSlicing extends GraphQLScalarType {
  constructor (fieldType, args) {
    super({
      name: `${getNamedType(fieldType)}_slicing_FHIRList`,
      serialize (value) {
        return value
      },
      parseValue (ast) {
        try {
          return valueFromAST(ast, fieldType)
        } catch (e) {
          console.log(e)
        }
      },

      parseLiteral (ast) {
        const { value } = args
        const values = valueFromAST(ast, fieldType)
        if (ast.kind !== 'ListValue') {
          throw new GraphQLError(
            `@slices directive works only on list values`,
            [ast]
          )
        }
        totalCount(value, values, ast)
        rules(value, values, ast)
        return this.parseValue(ast)
      }
    })
    this.ofType = getNamedType(fieldType)
    this.kind = 'List'
  }
}

module.exports = ListWithSlicing
