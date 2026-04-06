import { Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../types';
import * as tagService from '../services/tag.service';

export const createTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const input = tagService.createTagSchema.parse(req.body);
    const tag = await tagService.createTag(req.user!.userId, input);
    res.status(201).json(tag);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    if (error instanceof Error) {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTagsByUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tags = await tagService.getTagsByUser(req.user!.userId);
    res.status(200).json(tags);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const attachTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: documentId } = req.params;
    const { tagId } = req.body;

    if (!tagId || typeof tagId !== 'string') {
      res.status(400).json({ message: 'tagId là bắt buộc' });
      return;
    }

    const doc = await tagService.attachTag(req.user!.userId, documentId as string, tagId);
    res.status(200).json(doc);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const detachTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: documentId, tagId } = req.params;
    const result = await tagService.detachTag(
      req.user!.userId,
      documentId as string,
      tagId as string,
    );
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await tagService.deleteTag(req.user!.userId, req.params.tagId as string);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
