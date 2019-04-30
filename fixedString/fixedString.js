const { SchemaDirectiveVisitor } = require('graphql-tools')

class FixedStringDirective extends SchemaDirectiveVisitor {
  visitInputFieldDefinition (field) {
    field.defaultValue = this.args.value
    field.astNode.defaultValue = this.args.value
  }
}
module.exports = FixedStringDirective
