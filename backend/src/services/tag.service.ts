import { z } from 'zod';
import prisma from '../config/prisma';

// --- Zod Schemas ---
export const createTagSchema = z.object({
  name: z.string().min(1, { message: 'Tên tag không được để trống' }),
  color: z.string().optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

// --- Service Functions ---

export const createTag = async (userId: string, input: CreateTagInput) => {
  const existing = await prisma.tag.findUnique({
    where: { name_userId: { name: input.name, userId } },
  });
  if (existing) throw new Error('Tag với tên này đã tồn tại');

  return prisma.tag.create({
    data: {
      name: input.name,
      color: input.color ?? 'gray',
      userId,
    },
  });
};

export const getTagsByUser = async (userId: string) => {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
};

export const attachTag = async (userId: string, documentId: string, tagId: string) => {
  // Kiểm tra document thuộc user và chưa bị archive
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId, isArchived: false },
  });
  if (!doc) throw new Error('Document không tồn tại hoặc đã bị xóa');

  // Kiểm tra tag thuộc user
  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } });
  if (!tag) throw new Error('Tag không tồn tại');

  // Kiểm tra đã gắn chưa
  const existing = await prisma.documentTag.findUnique({
    where: { documentId_tagId: { documentId, tagId } },
  });
  if (existing) throw new Error('Tag đã được gắn vào document này');

  await prisma.documentTag.create({ data: { documentId, tagId } });

  return prisma.document.findUnique({
    where: { id: documentId },
    include: { tags: { include: { tag: true } } },
  });
};

export const detachTag = async (userId: string, documentId: string, tagId: string) => {
  // Kiểm tra document thuộc user
  const doc = await prisma.document.findFirst({ where: { id: documentId, userId } });
  if (!doc) throw new Error('Document không tồn tại');

  // Kiểm tra liên kết tồn tại
  const link = await prisma.documentTag.findUnique({
    where: { documentId_tagId: { documentId, tagId } },
  });
  if (!link) throw new Error('Tag chưa được gắn vào document này');

  await prisma.documentTag.delete({
    where: { documentId_tagId: { documentId, tagId } },
  });

  return { message: 'Đã gỡ tag thành công' };
};

export const deleteTag = async (userId: string, tagId: string) => {
  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } });
  if (!tag) throw new Error('Tag không tồn tại');

  // DocumentTag sẽ tự xóa nhờ onDelete: Cascade trong schema
  await prisma.tag.delete({ where: { id: tagId } });

  return { message: 'Đã xóa tag thành công' };
};
