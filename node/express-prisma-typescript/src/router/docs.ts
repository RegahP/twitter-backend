/**
 * @swagger
 * servers:
 *   - url: /api
 * tags:
 *   - name: Auth
 *     description: Signup and login
 *   - name: Users
 *     description: User profile and recommendations (requires auth)
 *   - name: Posts
 *     description: Create and read posts (requires auth)
 *   - name: Reactions
 *     description: Like/retweet reactions (requires auth)
 *   - name: Followers
 *     description: Follow relationships (requires auth)
 *   - name: Health
 *     description: Service health checks
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         code:
 *           type: integer
 *         errors:
 *           nullable: true
 *       example:
 *         message: Validation Error
 *         code: 400
 *         errors: []
 *
 *     Token:
 *       type: object
 *       required: [token]
 *       properties:
 *         token:
 *           type: string
 *       example:
 *         token: aaaa1111bbbb2222cccc3333dddd4444
 *
 *     SignupInput:
 *       type: object
 *       required: [email, username, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         password:
 *           type: string
 *           description: Must satisfy strong password rules
 *       example:
 *         email: name@email.com
 *         username: twiggeruser
 *         password: strongpassword1234
 *
 *     LoginInput:
 *       type: object
 *       required: [password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *         username:
 *           type: string
 *           nullable: true
 *         password:
 *           type: string
 *           description: Must satisfy strong password rules
 *       example:
 *         email: name@email.com
 *         password: strongpassword1234
 *
 *     User:
 *       type: object
 *       required: [id, createdAt, isPublic]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         isPublic:
 *           type: boolean
 *       example:
 *         id: d63e7746-f731-45a6-9479-30547ce3b113
 *         name: Jane Doe
 *         createdAt: 2025-12-12T00:00:00.000Z
 *         isPublic: true
 *
 *     Follow:
 *       type: object
 *       required: [id, followerId, followedId, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         followerId:
 *           type: string
 *           format: uuid
 *         followedId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     FollowActionInput:
 *       type: object
 *       required: [followedId]
 *       properties:
 *         followedId:
 *           type: string
 *           format: uuid
 *
 *     IsFollowingResponse:
 *       type: object
 *       required: [isFollowing]
 *       properties:
 *         isFollowing:
 *           type: boolean
 *       example:
 *         isFollowing: false
 *
 *     UnfollowResponse:
 *       type: object
 *       required: [unfollow]
 *       properties:
 *         unfollow:
 *           type: boolean
 *       example:
 *         unfollow: true
 *
 *     CreatePostInput:
 *       type: object
 *       required: [content]
 *       properties:
 *         content:
 *           type: string
 *           maxLength: 240
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 4
 *
 *     CreateCommentBody:
 *       type: object
 *       required: [content]
 *       properties:
 *         content:
 *           type: string
 *           maxLength: 240
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 4
 *
 *     Comment:
 *       type: object
 *       required: [id, parentId, authorId, content, images, createdAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         parentId:
 *           type: string
 *           format: uuid
 *         authorId:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Post:
 *       type: object
 *       required: [id, authorId, content, images, createdAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         authorId:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Reaction:
 *       type: object
 *       required: [id, userId, postId, type, createdAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         postId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [like, retweet]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInput'
 *     responses:
 *       201:
 *         description: Authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get recommended users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: List of recommended users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /user/me:
 *   get:
 *     summary: Get current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /user/{userId}:
 *   get:
 *     summary: Get a user by id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /follower/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: Present in route but not used by handler
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FollowActionInput'
 *     responses:
 *       200:
 *         description: Followed
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Cannot follow yourself
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Already following
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /follower/unfollow/{userId}:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: Present in route but not used by handler
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FollowActionInput'
 *     responses:
 *       200:
 *         description: Unfollow result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnfollowResponse'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /follower/is-following:
 *   get:
 *     summary: Check whether current user follows another user
 *     tags: [Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: followedId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Following status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IsFollowingResponse'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /follower/followers/{userId}:
 *   get:
 *     summary: Get followers of a user
 *     tags: [Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Followers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /follower/following/{userId}:
 *   get:
 *     summary: Get users followed by a user
 *     tags: [Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Following
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get latest posts from followed users
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Create a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInput'
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /post/{postId}:
 *   get:
 *     summary: Get a post by id (respects author privacy)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Private profile and not following
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete a post (author only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted post {postId}
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not the author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /post/by_user/{userId}:
 *   get:
 *     summary: Get posts by an author (respects author privacy)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Posts by author
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Private profile and not following
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /post/{postId}/comment:
 *   post:
 *     summary: Create a comment on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentBody'
 *     responses:
 *       201:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Private profile and not following
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /post/{postId}/comments:
 *   get:
 *     summary: List comments for a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Private profile and not following
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /reaction/{postId}:
 *   post:
 *     summary: React to a post
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [like, retweet]
 *     responses:
 *       201:
 *         description: Reaction created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reaction'
 *       400:
 *         description: Invalid reaction type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Duplicate reaction (unique by userId+postId+type)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete a reaction from a post
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [like, retweet]
 *     responses:
 *       200:
 *         description: Deleted reaction
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid reaction type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
