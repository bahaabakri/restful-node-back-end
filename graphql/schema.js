const graphql = require('graphql')

module.exports = graphql.buildSchema(`
    type User {
        _id: ID!,
        email: String!,
        password: String!,
        name: String!,
        status: String!,
        posts: [Post!]!
    }
    type Post {
        _id:ID!,
        title:String!,
        imageUrl:String!,
        content:String!,
        creator:User!,
        createdAt:String!,
        updatedAt:String!
    }
    input UserInputData {
        email: String!,
        password: String!,
        name: String!
    }
    type RootMutation {
        createUser(userInput:UserInputData): User!
    }
    type RootQuery {
        hello: String
    }
    schema {
        query:RootQuery
        mutation: RootMutation
    }
`)