const { GraphQLScalarType, valueFromAST, getNamedType } = require('graphql')
const { GraphQLError } = require('graphql/error')
const fhirpath = require('fhirpath')
const dot = require('dot-object')

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
        const { min: totalMin, max: totalMax } = value.find(
          ({ slicing }) => slicing
        )
        if (totalMin && values.length < totalMin) {
          throw new GraphQLError(`Minimum of ${totalMin} required`, [ast])
        }
        if (totalMax && values.length > totalMax) {
          throw new GraphQLError(`Maximum of ${totalMax} exceeded`, [ast])
        }
        const rules = value
          .filter(({ sliceName }) => sliceName)
          .reduce((a, { sliceName, min, max }) => {
            value
              .filter(({ id }) => id && id.startsWith(`${sliceName}.`))
              .forEach(value => {
                if (value.fixedCodeableConcept && (min || max)) {
                  const dotRule = dot.dot(value.fixedCodeableConcept)
                  const key = Object.keys(dotRule)[0]
                  if (min) {
                    a.push(
                      `(${value.path}.where(${key}='${
                        dotRule[key]
                      }').count() >= ${min})`
                    )
                  }
                  if (max) {
                    a.push(
                      `(${value.path}.where(${key}='${
                        dotRule[key]
                      }').count() <= ${max})`
                    )
                  }
                }
              })
            return a
          }, [])
        const evaluation = fhirpath.evaluate(values, rules.join('.combine'))
        const errIndex = evaluation.indexOf(false)
        if (errIndex !== -1) {
          throw new GraphQLError(`Slicing err at rule ${rules[errIndex]}`, [
            ast
          ])
        }
        return this.parseValue(ast)
      }
    })
    this.ofType = getNamedType(fieldType)
    this.kind = 'List'
  }
}

module.exports = ListWithSlicing
