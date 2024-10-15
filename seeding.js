const { PrismaClient } = require('@prisma/client');

// Initialisation de Prisma
const prisma = new PrismaClient();

async function seedDatabase() {
    // Données des utilisateurs
    const usersData = [
        { name: 'Alice', jobTitle: 'Software Engineer', skills: ['JavaScript', 'GraphQL'].join(',') },
        { name: 'Bob', jobTitle: 'Data Scientist', skills: ['Python', 'Machine Learning'].join(',') },
        { name: 'Charlie', jobTitle: 'DevOps Engineer', skills: ['Docker', 'Kubernetes'].join(',') }
    ];

    // Insérer les utilisateurs
    for (const userData of usersData) {
        const existingUser = await prisma.user.findFirst({
            where: { name: userData.name }
        });

        if (!existingUser) {
            await prisma.user.create({
                data: {
                    name: userData.name,
                    jobTitle: userData.jobTitle,
                    skills: userData.skills,  // Compétences stockées sous forme de chaîne
                },
            });
            console.log(`Utilisateur ajouté : ${userData.name}`);
        } else {
            console.log(`Utilisateur déjà présent : ${userData.name}`);
        }
    }

    // Récupérer les utilisateurs créés
    const alice = await prisma.user.findFirst({ where: { name: 'Alice' } });
    const bob = await prisma.user.findFirst({ where: { name: 'Bob' } });
    const charlie = await prisma.user.findFirst({ where: { name: 'Charlie' } });

    // Données des posts
    const postsData = [
        {
            content: 'Introduction à GraphQL avec Apollo',
            mediaUrl: 'https://example.com/graphql-apollo.jpg',
            authorId: alice.id,
        },
        {
            content: 'Machine Learning avec Python : astuces et outils',
            mediaUrl: 'https://example.com/ml-python.jpg',
            authorId: bob.id,
        },
        {
            content: 'Déploiement avec Docker et Kubernetes',
            mediaUrl: 'https://example.com/docker-k8s.jpg',
            authorId: charlie.id,
        }
    ];

    // Insérer les posts
    for (const postData of postsData) {
        const existingPost = await prisma.post.findFirst({
            where: { content: postData.content }
        });

        if (!existingPost) {
            await prisma.post.create({
                data: postData,
            });
            console.log(`Post ajouté : ${postData.content}`);
        } else {
            console.log(`Post déjà présent : ${postData.content}`);
        }
    }

    // Récupérer les posts créés
    const post1 = await prisma.post.findFirst({ where: { content: 'Introduction à GraphQL avec Apollo' } });
    const post2 = await prisma.post.findFirst({ where: { content: 'Machine Learning avec Python : astuces et outils' } });

    // Données des commentaires
    const commentsData = [
        { content: 'Super article, très informatif !', postId: post1.id, authorId: bob.id },
        { content: 'Merci pour ce post, j\'ai appris beaucoup.', postId: post1.id, authorId: charlie.id },
        { content: 'Excellente introduction au sujet.', postId: post2.id, authorId: alice.id }
    ];

    // Insérer les commentaires
    for (const commentData of commentsData) {
        const existingComment = await prisma.comment.findFirst({
            where: { content: commentData.content }
        });

        if (!existingComment) {
            await prisma.comment.create({
                data: commentData,
            });
            console.log(`Commentaire ajouté : ${commentData.content}`);
        } else {
            console.log(`Commentaire déjà présent : ${commentData.content}`);
        }
    }

    // Données des connexions entre utilisateurs
    const connectionsData = [
        { user1Id: alice.id, user2Id: bob.id },
        { user1Id: bob.id, user2Id: charlie.id },
        { user1Id: charlie.id, user2Id: alice.id }
    ];

    // Insérer les connexions
    for (const connectionData of connectionsData) {
        const existingConnection = await prisma.connection.findFirst({
            where: {
                user1Id: connectionData.user1Id,
                user2Id: connectionData.user2Id
            }
        });

        if (!existingConnection) {
            await prisma.connection.create({
                data: connectionData,
            });
            console.log(`Connexion ajoutée entre ${connectionData.user1Id} et ${connectionData.user2Id}`);
        } else {
            console.log('Connexion déjà présente');
        }
    }

    // Données des messages entre utilisateurs
    const messagesData = [
        { content: 'Salut Bob, comment ça va ?', senderId: alice.id, receiverId: bob.id },
        { content: 'Bien merci ! Et toi ?', senderId: bob.id, receiverId: alice.id },
        { content: 'Salut Charlie, tu as vu le nouveau projet ?', senderId: bob.id, receiverId: charlie.id },
        { content: 'Oui, j\'ai vu. Très intéressant.', senderId: charlie.id, receiverId: bob.id }
    ];

    // Insérer les messages
    for (const messageData of messagesData) {
        const existingMessage = await prisma.message.findFirst({
            where: { content: messageData.content }
        });

        if (!existingMessage) {
            await prisma.message.create({
                data: messageData,
            });
            console.log(`Message ajouté : ${messageData.content}`);
        } else {
            console.log(`Message déjà présent : ${messageData.content}`);
        }
    }

    console.log('📚 Base de données peuplée avec succès !');
}

// Exécuter la fonction de peuplement
seedDatabase()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });