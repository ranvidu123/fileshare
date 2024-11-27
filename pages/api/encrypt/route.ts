import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Readable } from 'stream'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const key = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

  const fileBuffer = await file.arrayBuffer()
  const fileStream = Readable.from(Buffer.from(fileBuffer))

  const encryptedChunks: Buffer[] = []
  
  for await (const chunk of fileStream) {
    encryptedChunks.push(cipher.update(chunk))
  }
  encryptedChunks.push(cipher.final())

  const encryptedBuffer = Buffer.concat([iv, ...encryptedChunks])

  return new NextResponse(encryptedBuffer, {
    headers: {
      'Content-Disposition': `attachment; filename="encrypted-${file.name}"`,
      'Content-Type': 'application/octet-stream',
    },
    status: 200,
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}

