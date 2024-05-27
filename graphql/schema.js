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
    input PostInputData {
        title:String!,
        content:String!,
        imageUrl:String!
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
    type UpdateDeletePostResponse {
        post: Post!,
        message: String!
    }
    type postsData {
        posts: [Post!]!,
        totalPosts: Int!
    }
    type updateGetStatus {
        status: String!,
        message: String!
    }
    type RootMutation {
        createUser(userInput:UserInputData): User!,
        createPost(postInput:PostInputData): Post!,
        deletePost(postId:ID!): UpdateDeletePostResponse!,
        updatePost(postId:ID!, postInput:PostInputData): UpdateDeletePostResponse!,
        updateStatus(newStatus: String!): updateGetStatus
    }
    type RootQuery {
        login(loginInput: loginInputData): loginResponse!,
        posts(page: Int!): postsData!,
        post(postId: ID!): Post!,
        status: updateGetStatus!
    }
    schema {
        query:RootQuery
        mutation: RootMutation
    }
`)