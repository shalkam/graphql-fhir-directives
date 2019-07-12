const { GraphQLError } = require('graphql/error')

module.exports = (args, values, ast) => {
  const { min: totalMin, max: totalMax } = args.find(({ slicing }) => slicing)
  if (totalMin && values.length < totalMin) {
    throw new GraphQLError(`Minimum of ${totalMin} required`, [ast])
  }
  if (totalMax && values.length > totalMax) {
    throw new GraphQLError(`Maximum of ${totalMax} exceeded`, [ast])
  }
}
