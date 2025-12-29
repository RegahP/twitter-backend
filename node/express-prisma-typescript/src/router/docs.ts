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
 *       required: [id, createdAt, isPublic, profileImageUrl]
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
 *         profileImageUrl:
 *           type: string
 *           nullable: true
 *           description: Public URL for the user's profile image (derived from stored S3 key)
 *       example:
 *         id: d63e7746-f731-45a6-9479-30547ce3b113
 *         name: Jane Doe
 *         createdAt: 2025-12-12T00:00:00.000Z
 *         isPublic: true
 *         profileImageUrl: https://your-bucket.s3.us-east-1.amazonaws.com/users/d63e7746-f731-45a6-9479-30547ce3b113/profile/abc.jpg

 *     PresignedUpload:
 *       type: object
 *       description: |
 *         Returned by the API for direct-to-S3 uploads.
 *
 *         Upload flow:
 *         1) `PUT` the raw image bytes to `uploadUrl` (this goes to S3, not this API).
 *         2) Use the returned `key` in a follow-up API call (e.g. create post, set profile image).
 *       required: [key, uploadUrl, publicUrl]
 *       properties:
 *         key:
 *           type: string
 *           description: S3 object key (store this in DB)
 *         uploadUrl:
 *           type: string
 *           description: Pre-signed `PUT` URL to upload bytes directly to S3 (send `Content-Type` matching the requested contentType)
 *         publicUrl:
 *           type: string
 *           description: Stable public URL for reads (bucket is public)
 *       example:
 *         key: users/USER_ID/profile/OBJECT_ID.png
 *         uploadUrl: https://your-bucket.s3.us-east-1.amazonaws.com/users/USER_ID/profile/OBJECT_ID.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=...
 *         publicUrl: https://your-bucket.s3.us-east-1.amazonaws.com/users/USER_ID/profile/OBJECT_ID.png

 *     CreateProfileImageUploadUrlInput:
 *       type: object
 *       required: [contentType]
 *       properties:
 *         contentType:
 *           type: string
 *           enum: [image/jpeg, image/png, image/webp]

 *     SetProfileImageKeyInput:
 *       type: object
 *       required: [profileImageKey]
 *       properties:
 *         profileImageKey:
 *           type: string
 *           description: Must be a key returned from the upload-url endpoint

 *     CreatePostImageUploadUrlsInput:
 *       type: object
 *       required: [contentTypes]
 *       properties:
 *         contentTypes:
 *           type: array
 *           maxItems: 4
 *           items:
 *             type: string
 *             enum: [image/jpeg, image/png, image/webp]

 *     PresignedUploadsResponse:
 *       type: object
 *       required: [uploads]
 *       properties:
 *         uploads:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PresignedUpload'
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
 *           description: |
 *             Post image references.
 *
 *             Recommended flow:
 *             1) `POST /post/images/upload-urls` to get `uploads[].key` and `uploads[].uploadUrl`
 *             2) `PUT uploads[].uploadUrl` with binary image bytes
 *             3) Use `uploads[].key` values here
 *
 *             Also accepted: full http(s) URLs.
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
 *           description: S3 object keys (recommended) or full http(s) URLs
 *           maxItems: 4
 *
 *     Comment:
 *       type: object
 *       required: [id, parentId, rootId, authorId, content, images, createdAt]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         parentId:
 *           type: string
 *           format: uuid
 *         rootId:
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

 * /user/me/profile-image/upload-url:
 *   post:
 *     summary: Create a pre-signed upload URL for profile image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Direct-to-S3 upload flow:
 *       1) Call this endpoint to get `{ key, uploadUrl, publicUrl }`.
 *       2) Upload the image bytes to S3 using the returned `uploadUrl` (not an API endpoint):
 *
 *          `PUT {uploadUrl}`
 *          Header: `Content-Type: <same contentType you requested>`
 *          Body: raw binary image bytes
 *
 *       3) Commit the key to the user's profile via `PATCH /user/me/profile-image` with `{ profileImageKey: key }`.
 *
 *       Note: Swagger UI can't automatically "chain" step (2) from the response. Copy `uploadUrl` into curl/Postman to perform the PUT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProfileImageUploadUrlInput'
 *     responses:
 *       200:
 *         description: Upload URL + key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresignedUpload'
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

 * /user/me/profile-image:
 *   patch:
 *     summary: Set current user's profile image key
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetProfileImageKeyInput'
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 * /follower/follow/{followedId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followedId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           description: ID of the user to follow
 *       - in: query
 *         name: followedId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Deprecated; use the path param instead
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
 * /follower/unfollow/{followedId}:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followedId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           description: ID of the user to unfollow
 *       - in: query
 *         name: followedId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Deprecated; use the path param instead
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
 *       403:
 *         description: Cannot unfollow yourself
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Not following
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
 *       403:
 *         description: Cannot check following status for yourself
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
 * /post/images/upload-urls:
 *   post:
 *     summary: Create pre-signed upload URLs for post images
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Direct-to-S3 upload flow:
 *       1) Call this endpoint with the image `contentTypes` to get `uploads[]`.
 *       2) For each item in `uploads`, upload the raw bytes to S3 using `PUT uploadUrl`.
 *       3) Create the post via `POST /post` using `images: [key1, key2, ...]`.
 *
 *       Note: the `uploadUrl` targets S3 and is time-limited; it is not an API endpoint.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostImageUploadUrlsInput'
 *     responses:
 *       200:
 *         description: Upload URLs + keys
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresignedUploadsResponse'
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
 *     description: |
 *       Creates a comment for the given parent post/comment.
 *
 *       Notes:
 *       - The API computes the `rootId` internally; clients do not send it.
 *       - The response includes `rootId` so clients can count/query without recursion.
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

 * /post/{postId}/comment_count_parent:
 *   get:
 *     summary: Count direct child comments for a post/comment
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
 *         description: Count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [count]
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: Missing/invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'

 * /post/{postId}/comment_count_root:
 *   get:
 *     summary: Count comments by rootId
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Counts all comments that share `rootId = postId`.
 *       This is intended to be used with a root post id.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [count]
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: Missing/invalid token
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
