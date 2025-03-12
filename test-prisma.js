// Simple script to test Prisma connection
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing Prisma connection...");

    // Try to create a test note
    const note = await prisma.note.create({
      data: {
        title: "Test Note",
        content: "This is a test note",
        userId: "test-user",
      },
    });

    console.log("Note created successfully:", note);

    // Clean up by deleting the test note
    await prisma.note.delete({
      where: {
        id: note.id,
      },
    });

    console.log("Test note deleted successfully");
    console.log("Prisma connection test passed!");
  } catch (error) {
    console.error("Error testing Prisma connection:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
