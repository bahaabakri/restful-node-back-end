const graphql = require('graphql')

module.exports = graphql.buildSchema(`
    type HelloQuery {
        text: String!
        views: Int!
    }
    type RootQuery {
        hello: HelloQuery!
    }
    schema {
        query: RootQuery
    }
`)