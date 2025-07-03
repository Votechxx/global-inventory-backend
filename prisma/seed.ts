// prisma/seed.ts
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const reportCategories = {
    ILLEGAL_CONTENT: {
        name: 'Illegal or Violating Content',
        description: 'Content that violates laws or platform policies',
        subCategories: [
            {
                name: 'Illegal Goods and Services',
                description: 'Selling or promoting illegal goods and services',
            },
            {
                name: 'Fraud or Scam',
                description: 'Fraudulent activities or scam attempts',
            },
            {
                name: 'IP Infringement',
                description: 'Intellectual property infringement',
            },
            {
                name: 'Impersonation',
                description: 'Fake or impersonation accounts',
            },
        ],
    },
    HARMFUL_CONTENT: {
        name: 'Harmful or Misleading Content',
        description: 'Content that is intentionally misleading or harmful',
        subCategories: [
            {
                name: 'Misinformation',
                description: 'False or misleading information',
            },
            {
                name: 'Fake News',
                description: 'Deliberately false news content',
            },
            {
                name: 'Phishing',
                description: 'Phishing attempts and related scams',
            },
            {
                name: 'Undermining Content',
                description:
                    'Content aimed at misleading or undermining others',
            },
        ],
    },
    HATE_VIOLENCE: {
        name: 'Content Promoting Hate or Violence',
        description: 'Content that promotes hatred or violence',
        subCategories: [
            {
                name: 'Hate Speech',
                description: 'Hate speech or incitement',
            },
            {
                name: 'Violence Promotion',
                description: 'Threats or promotion of violence',
            },
            {
                name: 'Extremist Content',
                description:
                    'Affiliation with dangerous or extremist organizations',
            },
        ],
    },
    SENSITIVE_CONTENT: {
        name: 'Abusive or Sensitive Content',
        description: 'Abusive, inappropriate, or sensitive content',
        subCategories: [
            {
                name: 'Harassment',
                description: 'Harassment or bullying',
            },
            {
                name: 'Sexual Content',
                description: 'Inappropriate sexual content',
            },
            {
                name: 'Child Exploitation',
                description: 'Child exploitation or promotion of such content',
            },
            {
                name: 'Violent Content',
                description: 'Disturbing or violent images/videos',
            },
        ],
    },
    SECURITY_ISSUES: {
        name: 'Account Security Issues',
        description: 'Issues related to account security',
        subCategories: [
            {
                name: 'Hacked Account',
                description: 'Compromised account reports',
            },
            {
                name: 'Malicious Apps',
                description: 'Promotion of malicious or harmful applications',
            },
        ],
    },
    OTHER: {
        name: 'Other Issues',
        description: 'Other platform violations',
        subCategories: [
            {
                name: 'Spam',
                description: 'Repeated posts or irrelevant content',
            },
            {
                name: 'Policy Violation',
                description: 'Violation of general usage policies',
            },
        ],
    },
};

async function cleanDatabase() {
    // Delete all tables
    console.log('Cleaning database...');

    // delete all users
    console.log('Deleting all users...');
    await prisma.user.deleteMany();
}

async function createAdmin() {
    console.log('Creating admin fromuser...');

    const configService: ConfigService = new ConfigService();

    const admin = await prisma.user.create({
        data: {
            email: configService.get('ADMIN_EMAIL'),
            password: configService.get('ADMIN_PASSWORD'),
            firstName: 'Mustafa',
            lastName: 'Elsharawy',
            role: 'ADMIN',
            verified: true,
            isDeleted: false,
            phoneNumber: '+201222222222',
        },
    });
    console.log(`Admin user created with email: ${admin.email}`);
    console.log(
        `Admin user created with password: ${configService.get('ADMIN_PASSWORD')}`,
    );
    console.log(`Admin user created with phone number: ${admin.phoneNumber}`);
}

async function main() {
    console.log(`Start seeding ...`);
    // Clean database
    await cleanDatabase();
    // Create admin user
    await createAdmin();
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
