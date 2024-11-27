'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function FileEncryption() {
  const [file, setFile] = useState<File | null>(null)
  const [decryptionKey, setDecryptionKey] = useState<string>('')
  const [decryptionFile, setDecryptionFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isDecryption: boolean = false) => {
    if (e.target.files) {
      if (isDecryption) {
        setDecryptionFile(e.target.files[0])
      } else {
        setFile(e.target.files[0])
      }
    }
  }

  const encryptFile = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/encrypt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Encryption failed')
      }

      const result = await response.json()
      setDecryptionKey(result.key)

      // Trigger download of encrypted file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'encrypted-' + file.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to encrypt file. Please try again.')
    }
  }

  const decryptFile = async () => {
    if (!decryptionFile || !decryptionKey) return

    const formData = new FormData()
    formData.append('file', decryptionFile)
    formData.append('key', decryptionKey)

    try {
      const response = await fetch('/api/decrypt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Decryption failed')
      }

      // Trigger download of decrypted file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'decrypted-' + decryptionFile.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to decrypt file. Please check your key and try again.')
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>File Encryption and Decryption</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <Label htmlFor="file-upload">Choose a file to encrypt</Label>
            <Input id="file-upload" type="file" onChange={(e) => handleFileChange(e)} className="mt-1" />
          </div>
          <Button onClick={encryptFile} disabled={!file} className="w-full">
            Encrypt File
          </Button>
          {decryptionKey && (
            <div>
              <Label htmlFor="decryption-key">Decryption Key (Save this)</Label>
              <Input
                id="decryption-key"
                type="text"
                value={decryptionKey}
                readOnly
                className="mt-1"
              />
            </div>
          )}
          <div className="border-t pt-4">
            <Label htmlFor="decrypt-file-upload">Choose a file to decrypt</Label>
            <Input id="decrypt-file-upload" type="file" onChange={(e) => handleFileChange(e, true)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="decrypt-key">Enter Decryption Key</Label>
            <Input
              id="decrypt-key"
              type="text"
              value={decryptionKey}
              onChange={(e) => setDecryptionKey(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            onClick={decryptFile}
            disabled={!decryptionFile || !decryptionKey}
            className="w-full"
          >
            Decrypt and Download File
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

