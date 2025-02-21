import express, { Request, Response } from "express";
import {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
} from "./user.service";
import { body, validationResult } from "express-validator";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List of users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of users per page
 *       - in: query
 *         name: disabled
 *         schema:
 *           type: boolean
 *         description: Filter users by disabled status
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const disabled = req.query.disabled
    ? req.query.disabled === "true"
    : undefined;

  const data = await getUsers(page, limit, disabled);
  res.json(data);
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created user
 */
router.post(
  "/",
  [
    body("name")
      .isString()
      .notEmpty()
      .withMessage("Name must be a string and cannot be empty"),
    body("email").isEmail().withMessage("Email must be a valid email address"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name } = req.body;
    const email = req.body.email.toLowerCase();

    const user = await getUserByEmail(email);

    if (user) {
      res.status(400).json({
        errors: [
          {
            type: "field",
            value: email,
            msg: "Email already exists",
            path: "email",
            location: "body",
          },
        ],
      });
      return;
    }

    const newUser = await createUser(name, email);
    res.status(201).json(newUser);
  }
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await getUserById(Number(id));
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               disabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated user details
 *       404:
 *         description: User not found
 */
router.put(
  "/:id",
  [
    body("name")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Name must be a string and cannot be empty"),
    body("disabled")
      .optional()
      .isBoolean()
      .withMessage("Disabled must be a boolean"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { id } = req.params;
    const { name, disabled } = req.body;
    try {
      const updatedUser = await updateUser(Number(id), { name, disabled });
      res.json(updatedUser);
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  }
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteUser(Number(id));
  if (result) {
    res.status(204).json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export default router;
