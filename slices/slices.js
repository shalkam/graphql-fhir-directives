const { getNamedType } = require('graphql')
const { SchemaDirectiveVisitor } = require('graphql-tools')
const ListWithSlicing = require('./ListWithSlicingType')
class SlicesDirective extends SchemaDirectiveVisitor {
  visitInputFieldDefinition (field) {
    const fieldType = field.type
    const type = new ListWithSlicing(fieldType, this.args)
    this.schema._typeMap[`${getNamedType(fieldType)}_FHIRListWithCard`] = type
    field.type = type
  }
}
module.exports = SlicesDirective
