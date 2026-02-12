import { prisma } from "../lib/prisma.js";

export const userRepository = {
  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },
};
