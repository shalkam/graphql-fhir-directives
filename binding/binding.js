const axios = require('axios')
const { getNamedType, GraphQLEnumType } = require('graphql')
const { GraphQLError } = require('graphql/error')
const { SchemaDirectiveVisitor } = require('graphql-tools')

class BindingDirective extends SchemaDirectiveVisitor {
  async code (field) {
    try {
      const {
        data: { concept }
      } = await axios.get(this.args.codeSystem)
      const values = {}
      concept.forEach(({ code, definition }) => {
        values[code] = { value: code, description: definition }
      })
      const codesEnum = new GraphQLEnumType({
        name: `Bound${field.type.name}Enum`,
        values
      })
      field.astNode.type.name.value = `Bound${field.type.name}Enum`
      this.schema._typeMap[`Bound${field.type.name}Enum`] = codesEnum
      field.type = codesEnum
    } catch (error) {
      console.log(error)
    }
  }
  async codeableConcept (field) {
    try {
      const {
        data: { concept }
      } = await axios.get(this.args.codeSystem)
      const values = {}
      concept.forEach(({ code, definition }) => {
        values[code.replace('-', '')] = { value: code, description: definition }
      })
      const codesEnum = new GraphQLEnumType({
        name: `Bound${field.type.ofType.name}Enum`,
        values
      })
      field.type.ofType._fields.coding.type.ofType._fields.code.astNode.type.name.value = `Bound${
        field.type.ofType.name
      }Enum`
      this.schema._typeMap[`Bound${field.type.ofType.name}Enum`] = codesEnum
      field.type.ofType._fields.coding.type.ofType._fields.code.type = codesEnum
    } catch (error) {
      console.log(error)
    }
  }
  visitInputFieldDefinition (field) {
    const type = getNamedType(field.type)
    if (
      !type.name.includes('CodeableConcept') &&
      !type.name.includes('Coding') &&
      !type.name === 'code'
    ) {
      throw new GraphQLError(
        'Can only bind types containing `CodeableConcept` or `Coding` in their name',
        [type]
      )
    }
    if (type.name.includes('CodeableConcept')) {
      this.codeableConcept(field)
    }
    if (type.name === 'code') {
      this.code(field)
    }
  }
}
module.exports = BindingDirective
