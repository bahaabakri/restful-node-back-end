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
    input loginInputData {
        email:String!,
        password: String!
    }
    type loginResponse {
        _id: ID!,
        email: String!,
        password: String!,
        name: String!,
        status: String!,
        posts: [Post!]!
        token:String!,
        userId:String!
    }
    type RootMutation {
        createUser(userInput:UserInputData): User!
    }
    type RootQuery {
        login(loginInput: loginInputData): loginResponse!
    }
    schema {
        query:RootQuery
        mutation: RootMutation
    }
`)