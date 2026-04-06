import { Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../types';
import * as documentService from '../services/document.service';

export const createDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const input = documentService.createDocumentSchema.parse(req.body);
    const doc = await documentService.createDocument(req.user!.userId, input);
    res.status(201).json(doc);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isArchived = req.query.isArchived === 'true';
    const docs = await documentService.getDocuments(req.user!.userId, isArchived);
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDocumentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await documentService.getDocumentById(req.user!.userId, req.params.id as string);
    res.status(200).json(doc);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const input = documentService.updateDocumentSchema.parse(req.body);
    const doc = await documentService.updateDocument(req.user!.userId, req.params.id as string, input);
    res.status(200).json(doc);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const archiveDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await documentService.archiveDocument(req.user!.userId, req.params.id as string);
    res.status(200).json(doc);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const restoreDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await documentService.restoreDocument(req.user!.userId, req.params.id as string);
    res.status(200).json(doc);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteDocumentPermanently = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await documentService.deleteDocumentPermanently(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) ?? '';
    const docs = await documentService.searchDocuments(req.user!.userId, query);
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
