import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "anish@example.com",
    },
  });

  await prisma.order.createMany({
    data: [
      {
        userId: user.id,
        status: "SHIPPED",
        trackingNumber: "TRK123456",
        deliveryStatus: "In Transit",
      },
      {
        userId: user.id,
        status: "DELIVERED",
        trackingNumber: "TRK789101",
        deliveryStatus: "Delivered",
      },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      {
        userId: user.id,
        amount: 1999,
        status: "PAID",
      },
      {
        userId: user.id,
        amount: 499,
        status: "REFUND_PENDING",
      },
    ],
  });

  await prisma.conversation.create({
    data: {
      userId: user.id,
      messages: {
        create: [
          {
            role: "user",
            content: "Hi, I want to check my recent order.",
          },
          {
            role: "assistant",
            content: "Sure, I can help you with that.",
          },
        ],
      },
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
