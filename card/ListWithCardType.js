const { GraphQLScalarType, valueFromAST, getNamedType } = require('graphql')
const { GraphQLError } = require('graphql/error')

class ListWithCard extends GraphQLScalarType {
  constructor (fieldType, args) {
    super({
      name: `${getNamedType(fieldType)}_FHIRListWithCard`,
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
        const { min, max } = args
        if (ast.kind !== 'ListValue') {
          return new GraphQLError(`@card directive works only on list values`, [
            ast
          ])
        }
        if (
          (max !== '*' && ast.values.length > parseInt(max)) ||
          ast.values.length < parseInt(min)
        ) {
          return new GraphQLError(
            `Wrong field cardinality length: ${
              ast.values.length
            } should be between ${min} and ${max} ListWithCard_${getNamedType(
              fieldType
            )}_`,
            [ast]
          )
        }
        return this.parseValue(ast)
      }
    })
    this.ofType = getNamedType(fieldType)
    this.kind = 'List'
  }
}

module.exports = ListWithCard
