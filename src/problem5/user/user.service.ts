import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (page: number, limit: number, disabled?: boolean) => {
  const skip = (page - 1) * limit;
  const where = disabled !== undefined ? { disabled } : {};

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
  });

  const totalUsers = await prisma.user.count({ where });
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    page,
    limit,
    totalPages,
    totalItems: totalUsers,
    items: users,
  };
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = async (name: string, email: string) => {
  return prisma.user.create({ data: { name, email } });
};

export const updateUser = async (id: number, input: { name?: string, disabled?: boolean }) => {
  try {
    return await prisma.user.update({ where: { id }, data: input });
  } catch (error) {
    return null;
  }
};

export const deleteUser = async (id: number) => {
  try {
    await prisma.user.delete({ where: { id } });
    return true;
  } catch (error) {
    return false;
  }
};
