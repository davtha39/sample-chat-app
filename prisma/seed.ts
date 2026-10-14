import 'dotenv/config';
import { prisma } from '../lib/prisma';

const sampleMessages = [
  {
    name: 'Alice',
    message: 'Hello everyone! Welcome to the chat.',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
  },
  {
    name: 'Bob',
    message: 'Hi Alice! This is a test message.',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
  },
  {
    name: 'Charlie',
    message: 'Real-time chat is working great!',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
  },
];

async function main() {
  for (const msg of sampleMessages) {
    await prisma.chats.create({
      data: msg,
    });
  }
  console.log(`Seeded ${sampleMessages.length} chat messages.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });