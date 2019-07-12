const dot = require('dot-object')

module.exports = args => {
  const rules = args
    .filter(({ sliceName }) => sliceName)
    .reduce((a, { sliceName, min, max }) => {
      args
        .filter(({ id }) => id && id.startsWith(`${sliceName}.`))
        .filter(({ fixedCodeableConcept }) => !!fixedCodeableConcept)
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
  return rules
}
