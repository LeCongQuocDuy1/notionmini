import { z } from 'zod';
import prisma from '../config/prisma';

// --- Zod Schemas ---
export const createDocumentSchema = z.object({
  title: z.string().optional(),
  parentDocumentId: z.string().uuid({ message: 'parentDocumentId không hợp lệ' }).nullish(),
});

export const updateDocumentSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

// --- Service Functions ---

export const createDocument = async (userId: string, input: CreateDocumentInput) => {
  // Nếu có parentDocumentId, kiểm tra document cha phải thuộc user và chưa bị archive
  if (input.parentDocumentId) {
    const parent = await prisma.document.findFirst({
      where: { id: input.parentDocumentId, userId, isArchived: false },
    });
    if (!parent) {
      throw new Error('Document cha không tồn tại hoặc đã bị xóa');
    }
  }

  return prisma.document.create({
    data: {
      title: input.title ?? 'Untitled',
      userId,
      parentDocumentId: input.parentDocumentId,
    },
    select: {
      id: true,
      title: true,
      icon: true,
      coverImage: true,
      isArchived: true,
      isPublished: true,
      parentDocumentId: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getDocuments = async (userId: string, isArchived: boolean) => {
  return prisma.document.findMany({
    where: { userId, isArchived },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      icon: true,
      coverImage: true,
      isArchived: true,
      isPublished: true,
      parentDocumentId: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getDocumentById = async (userId: string, documentId: string) => {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!doc) throw new Error('Document không tồn tại');
  return doc;
};

export const updateDocument = async (
  userId: string,
  documentId: string,
  input: UpdateDocumentInput,
) => {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId, isArchived: false },
  });
  if (!doc) throw new Error('Document không tồn tại hoặc đã bị xóa');

  return prisma.document.update({
    where: { id: documentId },
    data: input,
    select: {
      id: true,
      title: true,
      content: true,
      icon: true,
      coverImage: true,
      isArchived: true,
      isPublished: true,
      parentDocumentId: true,
      userId: true,
      updatedAt: true,
    },
  });
};

export const archiveDocument = async (userId: string, documentId: string) => {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId, isArchived: false },
  });
  if (!doc) throw new Error('Document không tồn tại hoặc đã bị xóa');

  // Đệ quy archive tất cả document con
  await archiveChildren(documentId);

  return prisma.document.update({
    where: { id: documentId },
    data: { isArchived: true },
    select: { id: true, title: true, isArchived: true },
  });
};

export const restoreDocument = async (userId: string, documentId: string) => {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId, isArchived: true },
  });
  if (!doc) throw new Error('Document không tồn tại hoặc chưa bị xóa');

  return prisma.document.update({
    where: { id: documentId },
    data: { isArchived: false },
    select: { id: true, title: true, isArchived: true },
  });
};

export const deleteDocumentPermanently = async (userId: string, documentId: string) => {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
  });
  if (!doc) throw new Error('Document không tồn tại');

  await prisma.document.delete({ where: { id: documentId } });
};

export const searchDocuments = async (userId: string, query: string) => {
  if (!query.trim()) return [];

  return prisma.document.findMany({
    where: {
      userId,
      isArchived: false,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      title: true,
      icon: true,
      parentDocumentId: true,
      updatedAt: true,
    },
  });
};

// Hàm đệ quy: archive toàn bộ cây con
const archiveChildren = async (parentId: string): Promise<void> => {
  const children = await prisma.document.findMany({
    where: { parentDocumentId: parentId, isArchived: false },
    select: { id: true },
  });

  for (const child of children) {
    await archiveChildren(child.id);
    await prisma.document.update({
      where: { id: child.id },
      data: { isArchived: true },
    });
  }
};
