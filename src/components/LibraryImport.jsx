import React, { useState } from 'react'
import { X, Upload, Book, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../supabaseClient'

const LibraryImport = ({ onClose, user }) => {
  const [importText, setImportText] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  const parseBooks = (text) => {
    // Split by lines and clean up
    const lines = text.split('\n').filter(line => line.trim())
    const books = []

    lines.forEach(line => {
      // Try different formats:
      // "Title by Author"
      // "Title - Author"
      // "Title: Author"
      // Just "Title" (if no author)

      let title = line.trim()
      let author = ''

      // Look for common separators
      const separators = [' by ', ' - ', ': ', ' — ']
      for (const sep of separators) {
        if (line.includes(sep)) {
          const parts = line.split(sep)
          title = parts[0].trim()
          author = parts.slice(1).join(sep).trim()
          break
        }
      }

      if (title) {
        books.push({
          title,
          author: author || 'Unknown',
          narrator: '',
          platform: 'manual',
          source_url: ''
        })
      }
    })

    return books
  }

  const importBooks = async () => {
    if (!importText.trim()) {
      setError('Please enter some book titles to import')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      const books = parseBooks(importText)

      if (books.length === 0) {
        setError('No valid book titles found. Try format: "Book Title by Author"')
        return
      }

      const importResults = []

      for (const book of books) {
        try {
          // Check if book already exists in user's library
          const { data: existing } = await supabase
            .from('user_library')
            .select('id')
            .eq('user_id', user.id)
            .eq('title', book.title)
            .eq('author', book.author)
            .limit(1)

          if (existing && existing.length > 0) {
            importResults.push({
              ...book,
              status: 'skipped',
              message: 'Already in library'
            })
            continue
          }

          // Insert new book
          const { error: insertError } = await supabase
            .from('user_library')
            .insert({
              user_id: user.id,
              ...book
            })

          if (insertError) {
            importResults.push({
              ...book,
              status: 'error',
              message: insertError.message
            })
          } else {
            importResults.push({
              ...book,
              status: 'success',
              message: 'Added to library'
            })
          }
        } catch (err) {
          importResults.push({
            ...book,
            status: 'error',
            message: err.message
          })
        }
      }

      setResults(importResults)
      setImportText('')

    } catch (err) {
      setError('Import failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Import Your Audiobook Library</h2>
          <p className="text-slate-400 text-sm">
            Add books you already own to get better recommendations. We won't suggest books you already have!
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Paste your book list (one per line):
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Example formats:
Dune by Frank Herbert
The Name of the Wind - Patrick Rothfuss
Project Hail Mary: Andy Weir
Just the title if no author`}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[200px] resize-none"
            />
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-400 mb-2">Supported Formats:</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• "Book Title by Author Name"</li>
              <li>• "Book Title - Author Name"</li>
              <li>• "Book Title: Author Name"</li>
              <li>• Just "Book Title" (author optional)</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-rose-400 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Import Results:</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${
                  result.status === 'success' ? 'bg-green-500/10 text-green-400' :
                  result.status === 'skipped' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-rose-500/10 text-rose-400'
                }`}>
                  {result.status === 'success' ? <CheckCircle size={14} /> :
                   result.status === 'skipped' ? <Book size={14} /> :
                   <AlertCircle size={14} />}
                  <span className="font-medium">"{result.title}"</span>
                  {result.author && result.author !== 'Unknown' && (
                    <span className="text-slate-400">by {result.author}</span>
                  )}
                  <span className="ml-auto text-xs">{result.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={importBooks}
            disabled={loading || !importText.trim()}
            className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all disabled:cursor-not-allowed"
          >
            {loading ? 'Importing...' : `Import Books (${importText.split('\n').filter(l => l.trim()).length})`}
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default LibraryImport
