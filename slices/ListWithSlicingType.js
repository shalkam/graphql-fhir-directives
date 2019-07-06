const { GraphQLScalarType, valueFromAST, getNamedType } = require('graphql')
const { GraphQLError } = require('graphql/error')

class ListWithSlicing extends GraphQLScalarType {
  constructor (fieldType, args) {
    super({
      name: `${getNamedType(fieldType)}_FHIRListWithSlicing`,
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
        if (ast.kind !== 'ListValue') {
          return new GraphQLError(`@slices directive works only on list values`, [
            ast
          ])
        }
        console.log('slicing', value)
        // if (
        //   (max !== '*' && ast.values.length > parseInt(max)) ||
        //   ast.values.length < parseInt(min)
        // ) {
        //   return new GraphQLError(
        //     `Wrong field cardinality length: ${
        //       ast.values.length
        //     } should be between ${min} and ${max} ListWithSlicing_${getNamedType(
        //       fieldType
        //     )}_`,
        //     [ast]
        //   )
        // }
        return this.parseValue(ast)
      }
    })
    this.ofType = getNamedType(fieldType)
    this.kind = 'List'
  }
}

module.exports = ListWithSlicing
