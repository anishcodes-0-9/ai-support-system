import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: {
      id: "4b200b02-1798-4d8a-9619-fb08176e4962",
    },
    update: {},
    create: {
      id: "4b200b02-1798-4d8a-9619-fb08176e4962",
      email: "anish@example.com",
    },
  });

  await prisma.order.createMany({
    data: [
      {
        userId: user.id,
        productName: "Wireless Headphones",
        status: "DELIVERED",
        trackingNumber: "TRK123456",
        deliveryStatus: "Delivered",
        estimatedDeliveryDate: new Date("2026-02-08"),
      },
      {
        userId: user.id,
        productName: "Gaming Keyboard",
        status: "OUT_FOR_DELIVERY",
        trackingNumber: "TRK777888",
        deliveryStatus: "Out for delivery",
        estimatedDeliveryDate: new Date(),
      },
      {
        userId: user.id,
        productName: "Laptop Stand",
        status: "PROCESSING",
        trackingNumber: "TRK999111",
        deliveryStatus: "Preparing shipment",
        estimatedDeliveryDate: new Date("2026-03-20"),
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

  console.log("🌱 Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
