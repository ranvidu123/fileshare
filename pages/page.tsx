import FileEncryption from '@/components/FileEncryption'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">File Encryption System</h1>
      <FileEncryption />
    </main>
  )
}

