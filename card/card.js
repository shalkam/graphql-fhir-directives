const { GraphQLNonNull, getNamedType } = require('graphql')
const { SchemaDirectiveVisitor } = require('graphql-tools')
const ListWithCard = require('./ListWithCardType')

class CardDirective extends SchemaDirectiveVisitor {
  visitInputFieldDefinition (field) {
    const fieldType = field.type
    const type = new ListWithCard(fieldType, this.args)
    this.schema._typeMap[`${getNamedType(fieldType)}_FHIRListWithCard`] = type
    field.type = this.args.min >= 1 ? GraphQLNonNull(type) : type
  }
}
module.exports = CardDirective
