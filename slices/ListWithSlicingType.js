const { GraphQLScalarType, valueFromAST, getNamedType } = require('graphql')
const { GraphQLError } = require('graphql/error')
const yup = require('yup')
const fhirpath = require('fhirpath')
const dot = require('dot-object')

yup.addMethod(yup.array, 'slicing', function (message, rules) {
  return this.test('slicing', message, function (list) {
    const evaluation = fhirpath.evaluate(list, rules.join('.combine'))
    const errIndex = evaluation.indexOf(false)
    if (errIndex !== -1) {
      return this.createError({
        path: `[${errIndex}]`,
        message: `${message} at rule ${rules[errIndex]}`
      })
    }
    return true
  })
})

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
        if (ast.kind !== 'ListValue') {
          return new GraphQLError(
            `@slices directive works only on list values`,
            [ast]
          )
        }
        const { min: totalMin, max: totalMax } = value.find(
          ({ slicing }) => slicing
        )
        const rules = value
          .filter(({ sliceName }) => sliceName)
          .reduce((a, { sliceName, min, max }) => {
            const fields = value
              .filter(({ id }) => id && id.startsWith(`${sliceName}.`))
              .map(value => {
                if (value.fixedCodeableConcept) {
                  const dotRule = dot.dot(value.fixedCodeableConcept)
                  const key = Object.keys(dotRule)[0]
                  const fhirpathRule = `(${value.path}.where(${key}='${
                    dotRule[key]
                  }').count() >= ${min} and ${value.path}.where(${key}='${
                    dotRule[key]
                  }').count() <= ${max})`
                  return fhirpathRule
                }
              })
            return [...a, ...fields]
          }, [])
        const validationSchema = yup
          .array()
          .when('$totalMin', (totalMin, schema) =>
            totalMin
              ? schema.min(totalMin, `Minimum of ${totalMin} required`)
              : schema
          )
          .when('$totalMax', (totalMax, schema) =>
            totalMax
              ? schema.max(totalMax, `Maximum of ${totalMax} exceeded`)
              : schema
          )
          .slicing('Slicing mismatch', rules)
        try {
          validationSchema.validateSync(valueFromAST(ast, fieldType), {
            context: { totalMax, totalMin }
          })
          return this.parseValue(ast)
        } catch (error) {
          throw new GraphQLError(error.message, [ast])
        }
      }
    })
    this.ofType = getNamedType(fieldType)
    this.kind = 'List'
  }
}

module.exports = ListWithSlicing
