// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTestData() {
  console.log('--- Cleaning Test Data ---');
  
  try {
    // Find all test users (emails ending with @test.com)
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: '@test.com'
        }
      }
    });

    console.log(`Found ${testUsers.length} test users to delete.`);

    for (const user of testUsers) {
      // Deleting a user can fail due to foreign key constraints if we don't handle relations
      // or if ON DELETE CASCADE is missing in Prisma.
      // Let's manually delete their dependencies first just to be safe.
      
      console.log(`Deleting test user: ${user.email}`);

      // Delete collaborations where this user is a collaborator
      await prisma.sessionCollaborator.deleteMany({
        where: { userId: user.id }
      });

      // Delete grades given by this user
      await prisma.grade.deleteMany({
        where: { teacherId: user.id }
      });

      // Delete sessions owned by this user
      const ownedSessions = await prisma.circuitSession.findMany({
        where: { ownerId: user.id }
      });

      for (const session of ownedSessions) {
        // Cascade delete session dependencies
        await prisma.actionHistoryEntry.deleteMany({ where: { sessionId: session.id } });
        await prisma.simulationResult.deleteMany({ where: { sessionId: session.id } });
        await prisma.report.deleteMany({ where: { sessionId: session.id } });
        await prisma.grade.deleteMany({ where: { sessionId: session.id } });
        await prisma.sessionCollaborator.deleteMany({ where: { sessionId: session.id } });
        
        await prisma.circuitSession.delete({ where: { id: session.id } });
      }

      // Delete labs created by this user
      const createdLabs = await prisma.lab.findMany({
        where: { teacherId: user.id }
      });

      for (const lab of createdLabs) {
        // Labs have sessions, delete sessions for this lab first
        const labSessions = await prisma.circuitSession.findMany({
          where: { labId: lab.id }
        });

        for (const session of labSessions) {
          await prisma.actionHistoryEntry.deleteMany({ where: { sessionId: session.id } });
          await prisma.simulationResult.deleteMany({ where: { sessionId: session.id } });
          await prisma.report.deleteMany({ where: { sessionId: session.id } });
          await prisma.grade.deleteMany({ where: { sessionId: session.id } });
          await prisma.sessionCollaborator.deleteMany({ where: { sessionId: session.id } });
          await prisma.circuitSession.delete({ where: { id: session.id } });
        }

        await prisma.lab.delete({ where: { id: lab.id } });
      }
      
      // Delete custom components created by this user
      await prisma.customComponent.deleteMany({
        where: { creatorId: user.id }
      });

      // Delete the user
      await prisma.user.delete({
        where: { id: user.id }
      });
    }

    console.log('✅ Test data cleaned successfully.');
  } catch (error) {
    console.error('Error cleaning test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTestData();
