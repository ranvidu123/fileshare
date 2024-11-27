'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FileEncryption() {
  const [file, setFile] = useState<File | null>(null)
  const [encryptedFile, setEncryptedFile] = useState<Uint8Array | null>(null)
  const [decryptionKey, setDecryptionKey] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const encryptFile = async () => {
    if (!file) return

    const key = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )

    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const fileData = await file.arrayBuffer()

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      fileData
    )

    const exportedKey = await window.crypto.subtle.exportKey('raw', key)
    const keyString = btoa(String.fromCharCode(...new Uint8Array(exportedKey)))

    setDecryptionKey(keyString)
    setEncryptedFile(new Uint8Array([...iv, ...new Uint8Array(encryptedContent)]))
  }

  const decryptAndDownload = async () => {
    if (!encryptedFile || !decryptionKey) return

    const keyData = Uint8Array.from(atob(decryptionKey), c => c.charCodeAt(0))
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM', length: 256 },
      true,
      ['decrypt']
    )

    const iv = encryptedFile.slice(0, 12)
    const encryptedContent = encryptedFile.slice(12)

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedContent
    )

    const blob = new Blob([decryptedContent], { type: file?.type || 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file?.name || 'decrypted-file'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">File Encryption and Decryption</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Choose a file</Label>
          <Input id="file-upload" type="file" onChange={handleFileChange} className="mt-1" />
        </div>
        <Button onClick={encryptFile} disabled={!file} className="w-full">
          Encrypt File
        </Button>
        {decryptionKey && (
          <div>
            <Label htmlFor="decryption-key">Decryption Key</Label>
            <Input
              id="decryption-key"
              type="text"
              value={decryptionKey}
              readOnly
              className="mt-1"
            />
          </div>
        )}
        <Button
          onClick={decryptAndDownload}
          disabled={!encryptedFile || !decryptionKey}
          className="w-full"
        >
          Decrypt and Download
        </Button>
      </div>
    </div>
  )
}

