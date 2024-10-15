// index.js
const { ApolloServer, gql } = require('apollo-server');
const { PrismaClient } = require('@prisma/client');
const DataLoader = require('dataloader');

// Initialisation de Prisma
const prisma = new PrismaClient();

// Définition du schéma GraphQL
const typeDefs = gql`
    type User {
        id: Int!
        name: String!
        jobTitle: String
        skills: [String!]!
        posts: [Post!]!
        connections: [User!]!
        sentMessages: [Message!]!
        receivedMessages: [Message!]!
    }

    type Post {
        id: Int!
        content: String!
        mediaUrl: String
        author: User!
        createdAt: String!
        comments: [Comment!]!
    }

    type Comment {
        id: Int!
        content: String!
        post: Post!
        author: User!
        createdAt: String!
    }

    type Connection {
        id: Int!
        user1: User!
        user2: User!
    }

    type Message {
        id: Int!
        content: String!
        sender: User!
        receiver: User!
        sentAt: String!
    }

    type Query {
        users: [User!]!
        user(id: Int!): User
        posts: [Post!]!
        post(id: Int!): Post
        comments: [Comment!]!
        commentsByPost(postId: Int!): [Comment!]!
        connections(userId: Int!): [User!]!
        sentMessages(senderId: Int!): [Message!]!
        receivedMessages(receiverId: Int!): [Message!]!
    }

    type Mutation {
        createUser(name: String!, jobTitle: String, skills: [String!]!): User!
        createPost(content: String!, authorId: Int!): Post!
        createComment(postId: Int!, authorId: Int!, content: String!): Comment!
    }
`;

// Définition des resolvers
const resolvers = {
    Query: {
        users: async () => {
            return prisma.user.findMany();
        },
        user: async (_, { id }) => {
            return prisma.user.findUnique({
                where: { id },
            });
        },
        posts: async () => {
            return prisma.post.findMany();
        },
        post: async (_, { id }) => {
            return prisma.post.findUnique({
                where: { id },
            });
        },
        comments: async () => {
            return prisma.comment.findMany();
        },
        commentsByPost: async (_, { postId }) => {
            return prisma.comment.findMany({
                where: { postId },
            });
        },
        connections: async (_, { userId }) => {
            const connections = await prisma.connection.findMany({
                where: {
                    OR: [{ user1Id: userId }, { user2Id: userId }],
                },
                include: {
                    user1: true,
                    user2: true,
                },
            });
            // Retourner les connexions
            return connections.map(connection =>
                connection.user1Id === userId ? connection.user2 : connection.user1
            );
        },
        sentMessages: async (_, { senderId }) => {
            return prisma.message.findMany({
                where: { senderId },
            });
        },
        receivedMessages: async (_, { receiverId }) => {
            return prisma.message.findMany({
                where: { receiverId },
            });
        },
    },
    User: {
        posts: async (user) => {
            return prisma.post.findMany({
                where: { authorId: user.id },
            });
        },
        connections: async (user) => {
            const connections = await prisma.connection.findMany({
                where: {
                    OR: [{ user1Id: user.id }, { user2Id: user.id }],
                },
                include: {
                    user1: true,
                    user2: true,
                },
            });
            return connections.map(connection =>
                connection.user1Id === user.id ? connection.user2 : connection.user1
            );
        },
        sentMessages: async (user) => {
            return prisma.message.findMany({
                where: { senderId: user.id },
            });
        },
        receivedMessages: async (user) => {
            return prisma.message.findMany({
                where: { receiverId: user.id },
            });
        },
    },
    Post: {
        author: async (post) => {
            return prisma.user.findUnique({
                where: { id: post.authorId },
            });
        },
        comments: async (post) => {
            return prisma.comment.findMany({
                where: { postId: post.id },
            });
        },
    },
    Comment: {
        post: async (comment) => {
            return prisma.post.findUnique({
                where: { id: comment.postId },
            });
        },
        author: async (comment) => {
            return prisma.user.findUnique({
                where: { id: comment.authorId },
            });
        },
    },

    // Résolveurs pour les messages
    Message: {
        sender: async (message) => {
            return prisma.user.findUnique({
                where: { id: message.senderId },
            });
        },
        receiver: async (message) => {
            return prisma.user.findUnique({
                where: { id: message.receiverId },
            });
        },
    },

    // Résolveurs pour les mutations
    Mutation: {
        createUser: async (_, { name, jobTitle, skills }) => {
            return prisma.user.create({
                data: { name, jobTitle, skills },
            });
        },
        createPost: async (_, { content, authorId }) => {
            return prisma.post.create({
                data: {
                    content,
                    authorId,
                },
            });
        },
        createComment: async (_, { postId, authorId, content }) => {
            return prisma.comment.create({
                data: {
                    postId,
                    authorId,
                    content,
                },
            });
        },
    },
};

// Création du serveur Apollo
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Lancement du serveur
server.listen({ port: 8502 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});