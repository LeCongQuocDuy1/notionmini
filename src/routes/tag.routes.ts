import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as tagController from '../controllers/tag.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Quản lý nhãn (tag)
 */

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Tạo tag mới
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Work
 *               color:
 *                 type: string
 *                 example: blue
 *     responses:
 *       201:
 *         description: Tạo tag thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       409:
 *         description: Tag đã tồn tại
 *       401:
 *         description: Chưa xác thực
 */
router.post('/', authMiddleware, tagController.createTag);

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Lấy danh sách tags của user
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tags
 *       401:
 *         description: Chưa xác thực
 */
router.get('/', authMiddleware, tagController.getTagsByUser);

/**
 * @swagger
 * /tags/{tagId}:
 *   delete:
 *     summary: Xóa tag (không xóa document)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa tag thành công
 *       404:
 *         description: Tag không tồn tại
 *       401:
 *         description: Chưa xác thực
 */
router.delete('/:tagId', authMiddleware, tagController.deleteTag);

export default router;
