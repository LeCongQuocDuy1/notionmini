import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as documentController from '../controllers/document.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Quản lý ghi chú
 */

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Tạo document mới
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: My Note
 *               parentDocumentId:
 *                 type: string
 *                 format: uuid
 *                 example: null
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực
 */
router.post('/', authMiddleware, documentController.createDocument);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Lấy danh sách documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isArchived
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái archive (true = thùng rác)
 *     responses:
 *       200:
 *         description: Danh sách documents
 *       401:
 *         description: Chưa xác thực
 */
router.get('/', authMiddleware, documentController.getDocuments);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Lấy chi tiết một document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết document
 *       404:
 *         description: Không tìm thấy
 *       401:
 *         description: Chưa xác thực
 */
router.get('/:id', authMiddleware, documentController.getDocumentById);

/**
 * @swagger
 * /documents/{id}:
 *   patch:
 *     summary: Cập nhật document (auto-save)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               icon:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 *       401:
 *         description: Chưa xác thực
 */
router.patch('/:id', authMiddleware, documentController.updateDocument);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Soft delete document (chuyển vào thùng rác)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã chuyển vào thùng rác
 *       404:
 *         description: Không tìm thấy
 *       401:
 *         description: Chưa xác thực
 */
router.delete('/:id', authMiddleware, documentController.archiveDocument);

export default router;
