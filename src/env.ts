const isServer = typeof window === 'undefined'

type ServerKey = 'SERVER_URL' | 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL' | 'MONGODB_URI' | 'MONGODB_DB_NAME' | 'S3_ENDPOINT' | 'S3_REGION' | 'S3_ACCESS_KEY_ID' | 'S3_SECRET_ACCESS_KEY' | 'S3_BUCKET_NAME' | 'MEDIA_BASE_URL'
type ClientKey = 'VITE_APP_TITLE'

const readServerEnv = (key: ServerKey, options?: { required?: boolean }) => {
  if (!isServer) {
    return undefined
  }

  const value = process.env[key]
  if (!value || value.length === 0) {
    if (options?.required) {
      throw new Error(`Missing required environment variable "${key}"`)
    }
    return undefined
  }
  return value
}

const readClientEnv = (key: ClientKey) => {
  if (isServer) {
    return process.env[key]
  }

  return import.meta.env[key]
}

export const env = {
  get SERVER_URL() {
    return readServerEnv('SERVER_URL')
  },
  get BETTER_AUTH_SECRET() {
    const value = readServerEnv('BETTER_AUTH_SECRET', { required: true })
    if (!value) {
      throw new Error('Missing BETTER_AUTH_SECRET')
    }
    return value
  },
  get BETTER_AUTH_URL() {
    const value = readServerEnv('BETTER_AUTH_URL', { required: true })
    if (!value) {
      throw new Error('Missing BETTER_AUTH_URL')
    }
    return value
  },
  get MONGODB_URI() {
    const value = readServerEnv('MONGODB_URI', { required: true })
    if (!value) {
      throw new Error('Missing MONGODB_URI')
    }
    return value
  },
  get MONGODB_DB_NAME() {
    return readServerEnv('MONGODB_DB_NAME')
  },
  get VITE_APP_TITLE() {
    return readClientEnv('VITE_APP_TITLE')
  },
  // S3 Storage (Hetzner)
  get S3_ENDPOINT() {
    return readServerEnv('S3_ENDPOINT')
  },
  get S3_REGION() {
    return readServerEnv('S3_REGION')
  },
  get S3_ACCESS_KEY_ID() {
    return readServerEnv('S3_ACCESS_KEY_ID')
  },
  get S3_SECRET_ACCESS_KEY() {
    return readServerEnv('S3_SECRET_ACCESS_KEY')
  },
  get S3_BUCKET_NAME() {
    return readServerEnv('S3_BUCKET_NAME')
  },
  // Media URL (for SEO-friendly URLs)
  get MEDIA_BASE_URL() {
    return readServerEnv('MEDIA_BASE_URL')
  },
}
