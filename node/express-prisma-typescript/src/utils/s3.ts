import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Constants } from './constants'

const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
])

const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'png', 'webp'])

const contentTypeToExtension = (contentType: string): string => {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return 'bin'
  }
}

export const assertAllowedImageContentType = (contentType: string): void => {
  if (!ALLOWED_IMAGE_CONTENT_TYPES.has(contentType)) {
    throw new Error("contentType must be one of 'image/jpeg', 'image/png', 'image/webp'")
  }
}

export const isHttpUrl = (value: string): boolean => {
  return value.startsWith('http://') || value.startsWith('https://')
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const assertAllowedImageExtension = (extension: string): void => {
  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    throw new Error("extension must be one of 'jpg', 'png', 'webp'")
  }
}

export const assertUserProfileImageKey = (userId: string, key: string): void => {
  const expectedPrefix = `users/${userId}/profile/`
  if (!key.startsWith(expectedPrefix)) {
    throw new Error(`key must start with ${expectedPrefix}`)
  }

  const regex = new RegExp(`^users/${escapeRegex(userId)}/profile/[^/]+\\.(jpg|png|webp)$`)
  if (!regex.test(key)) {
    throw new Error('key must match users/{userId}/profile/{filename}.(jpg|png|webp)')
  }
}

export const assertUserPostImageKey = (userId: string, key: string): void => {
  const expectedPrefix = `posts/${userId}/`
  if (!key.startsWith(expectedPrefix)) {
    throw new Error(`key must start with ${expectedPrefix}`)
  }

  const regex = new RegExp(`^posts/${escapeRegex(userId)}/[^/]+\\.(jpg|png|webp)$`)
  if (!regex.test(key)) {
    throw new Error('key must match posts/{userId}/{filename}.(jpg|png|webp)')
  }
}

export const buildS3PublicUrl = (key: string): string => {
  const bucket: string = Constants.AWS_S3_BUCKET_NAME
  const region: string = Constants.AWS_REGION

  if (bucket === 'CHANGE_ME_BUCKET' || bucket.trim().length === 0) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured')
  }

  if (region.trim().length === 0) {
    throw new Error('AWS_REGION is not configured')
  }

  // Virtual-hosted–style URL
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

export const maybeToS3PublicUrl = (value: string): string => {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return buildS3PublicUrl(value)
}

export interface PresignedPutResult {
  key: string
  uploadUrl: string
  publicUrl: string
}

export interface PresignedDeleteResult {
  key: string
  deleteUrl: string
}

export interface PresignPutOptions {
  key: string
  contentType: string
  expiresInSeconds?: number
}

export const createPresignedPutUrl = async (options: PresignPutOptions): Promise<PresignedPutResult> => {
  const bucket: string = Constants.AWS_S3_BUCKET_NAME
  const region: string = Constants.AWS_REGION

  assertAllowedImageContentType(options.contentType)

  if (bucket === 'CHANGE_ME_BUCKET' || bucket.trim().length === 0) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured')
  }

  if (region.trim().length === 0) {
    throw new Error('AWS_REGION is not configured')
  }

  const s3 = new S3Client({
    region,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED'
  })
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: options.key,
    ContentType: options.contentType
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: options.expiresInSeconds ?? 300 })
  const publicUrl = buildS3PublicUrl(options.key)

  return { key: options.key, uploadUrl, publicUrl }
}

export interface PresignDeleteOptions {
  key: string
  expiresInSeconds?: number
}

export const createPresignedDeleteUrl = async (options: PresignDeleteOptions): Promise<PresignedDeleteResult> => {
  const bucket: string = Constants.AWS_S3_BUCKET_NAME
  const region: string = Constants.AWS_REGION

  if (bucket === 'CHANGE_ME_BUCKET' || bucket.trim().length === 0) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured')
  }

  if (region.trim().length === 0) {
    throw new Error('AWS_REGION is not configured')
  }

  const s3 = new S3Client({
    region,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED'
  })
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: options.key
  })

  const deleteUrl = await getSignedUrl(s3, command, { expiresIn: options.expiresInSeconds ?? 300 })

  return { key: options.key, deleteUrl }
}

export const buildUserProfileImageKey = (userId: string, contentType: string, objectId: string): string => {
  const ext = contentTypeToExtension(contentType)
  assertAllowedImageExtension(ext)
  return `users/${userId}/profile/${objectId}.${ext}`
}

export const buildPostImageKey = (userId: string, contentType: string, objectId: string): string => {
  const ext = contentTypeToExtension(contentType)
  assertAllowedImageExtension(ext)
  return `posts/${userId}/${objectId}.${ext}`
}
