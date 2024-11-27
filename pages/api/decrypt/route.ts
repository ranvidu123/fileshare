import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Readable } from 'stream'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const key = formData.get('key') as string

  if (!file || !key) {
    return NextResponse.json({ error: 'File and key are required' }, { status: 400 })
  }

  const fileBuffer = await file.arrayBuffer()
  const iv = Buffer.from(fileBuffer.slice(0, 16))
  const encryptedData = Buffer.from(fileBuffer.slice(16))

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv)

  const decryptedChunks: Buffer[] = []

  try {
    const encryptedStream = Readable.from(encryptedData)
    for await (const chunk of encryptedStream) {
      decryptedChunks.push(decipher.update(chunk))
    }
    decryptedChunks.push(decipher.final())
  } catch (error) {
    return NextResponse.json({ error: 'Decryption failed' }, { status: 400 })
  }

  const decryptedBuffer = Buffer.concat(decryptedChunks)

  return new NextResponse(decryptedBuffer, {
    headers: {
      'Content-Disposition': `attachment; filename="decrypted-${file.name}"`,
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

