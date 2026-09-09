'use client'

import React, { useState } from 'react'
import { Download, FileText, X } from 'lucide-react'

interface DownloadPdfModalProps {
  isOpen: boolean
  onClose: () => void
  defaultFileName: string
  downloadUrl: string
  title?: string
}

export function DownloadPdfModal({
  isOpen,
  onClose,
  defaultFileName,
  downloadUrl,
  title = 'Download PDF',
}: DownloadPdfModalProps) {
  const [fileName, setFileName] = useState(defaultFileName)
  const [isDownloading, setIsDownloading] = useState(false)

  // Sync default file name if changed
  React.useEffect(() => {
    if (isOpen) {
      setFileName(defaultFileName.replace(/\.pdf$/i, ''))
    }
  }, [isOpen, defaultFileName])

  if (!isOpen) return null

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsDownloading(true)

    try {
      const cleanName = (fileName.trim() || 'document').replace(/\.pdf$/i, '')
      const finalFileName = `${cleanName}.pdf`
      const fetchUrl = `${downloadUrl}${downloadUrl.includes('?') ? '&' : '?'}filename=${encodeURIComponent(finalFileName)}`

      const res = await fetch(fetchUrl)
      if (!res.ok) throw new Error('Failed to download PDF')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = finalFileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDownload} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 uppercase tracking-wider">
              File Name
            </label>
            <div className="flex items-center rounded-lg bg-neutral-950 border border-neutral-800 focus-within:border-indigo-500 transition-colors overflow-hidden">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                autoFocus
                placeholder="Enter custom file name"
                className="w-full px-3.5 py-2.5 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
              <span className="px-3 text-xs font-mono text-neutral-500 border-l border-neutral-800 bg-neutral-900/50 py-2.5">
                .pdf
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1.5">
              Customize the name before saving it to your device.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Save & Download'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
