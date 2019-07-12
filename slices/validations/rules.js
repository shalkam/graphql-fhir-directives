const { GraphQLError } = require('graphql/error')
const fhirpath = require('fhirpath')
const codeableConceptrules = require('./codeableConceptRules')

module.exports = (args, values, ast) => {
  const rules = [...codeableConceptrules(args)]
  const evaluation = fhirpath.evaluate(values, rules.join('.combine'))
  const errIndex = evaluation.indexOf(false)
  if (errIndex !== -1) {
    throw new GraphQLError(`Slicing err at rule ${rules[errIndex]}`, [ast])
  }
}
