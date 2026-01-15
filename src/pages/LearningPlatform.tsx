import { useState, useEffect, useCallback } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAdminStore } from '@/store/adminStore'
import { Lesson, LessonTopic } from '@/types'
import {
  getAllLessons,
  addLesson,
  updateLesson,
  deleteLesson,
} from '@/services/firestoreService'
import { uploadFile, deleteFile } from '@/services/storageService'
import {
  BookOpen,
  FileText,
  Link2,
  Plus,
  X,
  ChevronRight,
  GraduationCap,
  Video,
  ExternalLink,
  Trash2,
  Edit3,
  Search,
  Loader2,
  Youtube,
  Upload,
} from 'lucide-react'

// Simple cn utility inline
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Темы уроков
const TOPICS = [
  { id: 'memecoins', label: 'Мемкоины', icon: 'coins', color: 'emerald' },
  { id: 'polymarket', label: 'Polymarket', icon: 'barchart', color: 'pink' },
  { id: 'nft', label: 'NFT', icon: 'image', color: 'purple' },
  { id: 'staking', label: 'Стейкинг', icon: 'shield', color: 'indigo' },
  { id: 'spot', label: 'Спотовая торговля', icon: 'trending', color: 'amber' },
  { id: 'futures', label: 'Фьючерсная торговля', icon: 'bar_chart', color: 'blue' },
  { id: 'airdrop', label: 'AirDrop', icon: 'gift', color: 'cyan' },
] as const

type TopicId = typeof TOPICS[number]['id']

// Форма добавления ресурса
const ResourceForm: React.FC<{
  onAdd: (resource: { title: string; url: string; description: string }) => void
  onCancel: () => void
  theme: string
}> = ({ onAdd, onCancel, theme }) => {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (!title || !url) return
    onAdd({ title, url, description })
    setTitle('')
    setUrl('')
    setDescription('')
  }

  return (
    <div className={cn(
      "p-4 rounded-xl border mb-4",
      theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
    )}>
      <div className="grid gap-3">
        <div>
          <input
            type="text"
            placeholder="Название ресурса *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(
              "w-full px-3 py-2 rounded-lg border text-sm",
              theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            )}
          />
        </div>
        <div>
          <input
            type="url"
            placeholder="Ссылка *"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={cn(
              "w-full px-3 py-2 rounded-lg border text-sm",
              theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            )}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Описание (необязательно)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={cn(
              "w-full px-3 py-2 rounded-lg border text-sm",
              theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            )}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!url || !title}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Добавить
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}

// Модальное окно добавления/редактирования урока
const LessonModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSave: (lesson: Partial<Lesson> & { newVideoFiles?: File[]; newFileFiles?: File[] }) => void
  editingLesson?: Lesson | null
  topics: typeof TOPICS
  theme: string
}> = ({ isOpen, onClose, onSave, editingLesson, topics, theme }) => {
  const [formData, setFormData] = useState<Partial<Lesson>>({
    topicId: topics[0].id,
    lessonNumber: 1,
    title: '',
    comment: '',
    resources: [],
    youtubeUrls: [],
    videos: [],
    files: [],
  })
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([''])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [fileFiles, setFileFiles] = useState<File[]>([])
  const [showResourceForm, setShowResourceForm] = useState(false)

  useEffect(() => {
    if (editingLesson) {
      setFormData({
        topicId: editingLesson.topicId,
        lessonNumber: editingLesson.lessonNumber,
        title: editingLesson.title,
        comment: editingLesson.comment,
        resources: editingLesson.resources,
        videos: editingLesson.videos || [],
        files: editingLesson.files || [],
        youtubeUrls: editingLesson.youtubeUrls || (editingLesson.youtubeUrl ? [editingLesson.youtubeUrl] : []),
      })
      setYoutubeUrls(editingLesson.youtubeUrls?.length ? editingLesson.youtubeUrls : (editingLesson.youtubeUrl ? [editingLesson.youtubeUrl] : ['']))
      setVideoFiles([])
      setFileFiles([])
    } else {
      setFormData({
        topicId: topics[0].id,
        lessonNumber: 1,
        title: '',
        comment: '',
        resources: [],
        youtubeUrls: [],
        videos: [],
        files: [],
      })
      setYoutubeUrls([''])
      setVideoFiles([])
      setFileFiles([])
    }
  }, [editingLesson, isOpen, topics])

  const handleSubmit = () => {
    if (!formData.title || !formData.topicId) return
    onSave({
      ...formData,
      youtubeUrls: youtubeUrls.filter(url => url.trim() !== ''),
      newVideoFiles: videoFiles,
      newFileFiles: fileFiles,
    })
    setVideoFiles([])
    setFileFiles([])
    setYoutubeUrls([''])
    onClose()
  }

  const addResource = (resource: { title: string; url: string; description: string }) => {
    const newResource = {
      id: Date.now().toString(),
      ...resource,
    }
    setFormData(prev => ({
      ...prev,
      resources: [...(prev.resources || []), newResource],
    }))
    setShowResourceForm(false)
  }

  const removeResource = (id: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources?.filter(r => r.id !== id) || [],
    }))
  }

  const addYoutubeField = () => setYoutubeUrls(prev => [...prev, ''])
  const removeYoutubeField = (index: number) => setYoutubeUrls(prev => prev.filter((_, i) => i !== index))
  const updateYoutubeUrl = (index: number, val: string) => {
    const newUrls = [...youtubeUrls]
    newUrls[index] = val
    setYoutubeUrls(newUrls)
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeNewVideo = (index: number) => setVideoFiles(prev => prev.filter((_, i) => i !== index))
  const removeNewFile = (index: number) => setFileFiles(prev => prev.filter((_, i) => i !== index))

  const removeExistingVideo = (url: string) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos?.filter(v => v.url !== url) || []
    }))
  }
  const removeExistingFile = (url: string) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files?.filter(f => f.url !== url) || []
    }))
  }

  const getTopicColor = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
      pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
    }
    return colors[color] || colors.emerald
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl",
        theme === 'dark' ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-gray-200'
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          theme === 'dark' ? 'border-white/10' : 'border-gray-200'
        )}>
          <h2 className={cn(
            "text-xl font-bold",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {editingLesson ? 'Редактировать урок' : 'Добавить урок'}
          </h2>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            )}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Тема */}
          <div>
            <label className={cn(
              "block text-sm font-medium mb-2",
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Тема *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {topics.map((topic) => {
                const color = getTopicColor(topic.color)
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, topicId: topic.id as LessonTopic }))}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                      formData.topicId === topic.id
                        ? color.bg
                        : theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                    )}
                  >
                    <span className={cn(
                      formData.topicId === topic.id ? color.text : 'text-gray-600 dark:text-gray-400'
                    )}>
                      {topic.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Номер урока и Название */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={cn(
                "block text-sm font-medium mb-2",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Номер урока
              </label>
              <input
                type="number"
                min="1"
                value={formData.lessonNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, lessonNumber: parseInt(e.target.value) || 1 }))}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl border font-medium",
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white focus-emerald-500/50'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus-emerald-500'
                )}
              />
            </div>
            <div className="col-span-2">
              <label className={cn(
                "block text-sm font-medium mb-2",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Название урока *
              </label>
              <input
                type="text"
                placeholder="Введите название урока"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl border font-medium",
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus-emerald-500/50'
                    : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400 focus-emerald-500'
                )}
              />
            </div>
          </div>

          {/* Комментарий */}
          <div>
            <label className={cn(
              "block text-sm font-medium mb-2",
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              Комментарий
            </label>
            <textarea
              rows={3}
              placeholder="Добавьте описание или комментарий к уроку..."
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              className={cn(
                "w-full px-4 py-2.5 rounded-xl border font-medium resize-none",
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus-emerald-500/50'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus-emerald-500'
              )}
            />
          </div>

          {/* YouTube Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={cn(
                "block text-sm font-medium",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  Ссылки на YouTube
                </div>
              </label>
              <button
                type="button"
                onClick={addYoutubeField}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {youtubeUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => updateYoutubeUrl(index, e.target.value)}
                    className={cn(
                      "flex-1 px-4 py-2.5 rounded-xl border font-medium text-sm",
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus-emerald-500/50'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus-emerald-500'
                    )}
                  />
                  {youtubeUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeYoutubeField(index)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video & File Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Video Files */}
            <div>
              <label className={cn(
                "block text-sm font-medium mb-2",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-500" />
                  Видео файлы
                </div>
              </label>

              <div className="space-y-2 mb-2">
                {/* Existing Videos */}
                {formData.videos?.map((vid, idx) => (
                  <div key={`exist-vid-${idx}`} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-xs font-medium text-emerald-500 truncate max-w-[150px]">{vid.name}</span>
                    <button type="button" onClick={() => removeExistingVideo(vid.url)} className="text-red-500 p-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                {/* New Videos */}
                {videoFiles.map((f, idx) => (
                  <div key={`new-vid-${idx}`} className="flex items-center justify-between p-2 rounded-lg bg-gray-500/5 border border-dashed border-gray-500/20">
                    <span className="text-xs font-medium text-gray-500 truncate max-w-[150px]">{f.name}</span>
                    <button type="button" onClick={() => removeNewVideo(idx)} className="text-red-500 p-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>

              <div className="relative group">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoSelect}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-20 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                    theme === 'dark'
                      ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">Добавить видео</span>
                  </div>
                </label>
              </div>
            </div>

            {/* General Files */}
            <div>
              <label className={cn(
                "block text-sm font-medium mb-2",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Файлы
                </div>
              </label>

              <div className="space-y-2 mb-2">
                {/* Existing Files */}
                {formData.files?.map((file, idx) => (
                  <div key={`exist-file-${idx}`} className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <span className="text-xs font-medium text-blue-500 truncate max-w-[150px]">{file.name}</span>
                    <button type="button" onClick={() => removeExistingFile(file.url)} className="text-red-500 p-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                {/* New Files */}
                {fileFiles.map((f, idx) => (
                  <div key={`new-file-${idx}`} className="flex items-center justify-between p-2 rounded-lg bg-gray-500/5 border border-dashed border-gray-500/20">
                    <span className="text-xs font-medium text-gray-500 truncate max-w-[150px]">{f.name}</span>
                    <button type="button" onClick={() => removeNewFile(idx)} className="text-red-500 p-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>

              <div className="relative group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-20 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                    theme === 'dark'
                      ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">Добавить файлы</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Полезные ресурсы */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={cn(
                "block text-sm font-medium",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                Полезные ресурсы
              </label>
              <button
                type="button"
                onClick={() => setShowResourceForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Добавить
              </button>
            </div>

            {/* Список ресурсов */}
            {formData.resources && formData.resources.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.resources.slice(0, 3).map((resource) => (
                  <div
                    key={resource.id}
                    className={cn(
                      "flex items-start justify-between gap-3 p-3 rounded-xl",
                      theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className={cn(
                          "font-medium truncate",
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        )}>
                          {resource.title}
                        </span>
                      </div>
                      {resource.description && (
                        <p className={cn(
                          "text-sm mt-1 line-clamp-2",
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        )}>
                          {resource.description}
                        </p>
                      )}
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-500 hover:underline mt-1 inline-flex items-center gap-1"
                      >
                        {resource.url.slice(0, 40)}...
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeResource(resource.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Форма добавления ресурса */}
            {showResourceForm && (
              <ResourceForm
                onAdd={addResource}
                onCancel={() => setShowResourceForm(false)}
                theme={theme}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "flex items-center justify-end gap-3 px-6 py-4 border-t",
          theme === 'dark' ? 'border-white/10' : 'border-gray-200'
        )}>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "px-5 py-2.5 rounded-xl font-medium transition-colors",
              theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formData.title || !formData.topicId}
            className="px-5 py-2.5 rounded-xl font-medium bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {editingLesson ? 'Сохранить' : 'Добавить урок'}
          </button>
        </div>
      </div>
    </div>
  )
}

const getYoutubeThumbnail = (url: string) => {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`
  }
  return null
}

// Компонент карточки урока
const LessonCard: React.FC<{
  lesson: Lesson
  topicColor: { bg: string; text: string; border: string; gradient: string }
  onEdit: () => void
  onDelete: () => void
  canEdit: boolean
  theme: string
}> = ({ lesson, topicColor, onEdit, onDelete, canEdit, theme }) => {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl",
      theme === 'dark'
        ? 'bg-[#1a1a1a] border-white/10 hover:border-white/20'
        : 'bg-white border-gray-200 hover:border-gray-300'
    )}>
      {/* Decorative gradient */}
      <div className={cn(
        "absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity",
        `bg-gradient-to-br ${topicColor.gradient}`
      )} />

      <div className="relative p-5">
        {/* Preview image/video if available */}
        {(lesson.youtubeUrls?.length || lesson.videos?.length || lesson.youtubeUrl || lesson.videoUrl) && (
          <div className="mb-4 aspect-video rounded-xl overflow-hidden bg-black/20 group-preview">
            {lesson.youtubeUrls?.length ? (
              <div className="relative w-full h-full">
                <img
                  src={getYoutubeThumbnail(lesson.youtubeUrls[0]) || ''}
                  alt={lesson.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Youtube className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>
                <a
                  href={lesson.youtubeUrls[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0"
                />
              </div>
            ) : lesson.videos?.length ? (
              <div className="relative w-full h-full">
                <video
                  src={lesson.videos[0].url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
                <a
                  href={lesson.videos[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0"
                />
              </div>
            ) : lesson.youtubeUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={getYoutubeThumbnail(lesson.youtubeUrl) || ''}
                  alt={lesson.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Youtube className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>
                <a
                  href={lesson.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0"
                />
              </div>
            ) : lesson.videoUrl ? (
              <div className="relative w-full h-full">
                <video
                  src={lesson.videoUrl}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
                <a
                  href={lesson.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0"
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              topicColor.bg
            )}>
              <span className={cn("text-lg font-black", topicColor.text)}>
                {lesson.lessonNumber}
              </span>
            </div>
            <div>
              <h3 className={cn(
                "font-bold leading-tight",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {lesson.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Обновлено {lesson.updatedAt}
              </p>
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
                title="Редактировать"
              >
                <Edit3 className="w-4 h-4 text-emerald-500" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          )}
        </div>

        {/* Comment */}
        {lesson.comment && (
          <p className={cn(
            "text-sm mb-4 line-clamp-2",
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            {lesson.comment}
          </p>
        )}

        {/* Resources */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* YouTube Links */}
          {(lesson.youtubeUrls || (lesson.youtubeUrl ? [lesson.youtubeUrl] : [])).map((url, idx) => (
            <a
              key={`yt-${idx}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                theme === 'dark'
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              )}
            >
              <Youtube className="w-3 h-3" />
              YouTube {lesson.youtubeUrls && lesson.youtubeUrls.length > 1 ? `#${idx + 1}` : ''}
            </a>
          ))}

          {/* Video Files */}
          {(lesson.videos || (lesson.videoUrl ? [{ url: lesson.videoUrl, name: lesson.videoFileName || 'Видео' }] : [])).map((vid, idx) => (
            <a
              key={`vid-${idx}`}
              href={vid.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                theme === 'dark'
                  ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              )}
            >
              <Video className="w-3 h-3" />
              {vid.name}
            </a>
          ))}

          {/* Files */}
          {(lesson.files || (lesson.fileUrl ? [{ url: lesson.fileUrl, name: lesson.fileName || 'Файл' }] : [])).map((file, idx) => (
            <a
              key={`file-${idx}`}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                theme === 'dark'
                  ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              )}
            >
              <FileText className="w-3 h-3" />
              {file.name}
            </a>
          ))}

          {/* External Resources */}
          {lesson.resources.slice(0, 3).map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                theme === 'dark'
                  ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Link2 className="w-3 h-3" />
              {resource.title}
            </a>
          ))}
          {lesson.resources.length > 3 && (
            <span className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium",
              theme === 'dark' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            )}>
              +{lesson.resources.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          "flex items-center justify-between pt-4 border-t border-dashed border-opacity-20 border-gray-500",
          theme === 'dark' ? 'border-white/10' : 'border-gray-200'
        )}>
          <div className="flex items-center gap-3">
            {(lesson.videos?.length || lesson.youtubeUrls?.length || lesson.videoUrl || lesson.youtubeUrl) && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                <Video className="w-3.5 h-3.5" />
                Видео ({(lesson.videos?.length || 0) + (lesson.youtubeUrls?.length || 0) || 1})
              </div>
            )}
            {(lesson.files?.length || lesson.fileUrl) && (
              <div className="flex items-center gap-1.5 text-xs text-blue-500">
                <FileText className="w-3.5 h-3.5" />
                Файлы ({(lesson.files?.length || 0) || 1})
              </div>
            )}
            {lesson.resources.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-purple-500">
                <Link2 className="w-3.5 h-3.5" />
                {lesson.resources.length} ресурс{lesson.resources.length === 1 ? '' : lesson.resources.length < 5 ? 'а' : 'ов'}
              </div>
            )}
          </div>

          <ChevronRight className={cn(
            "w-5 h-5 transition-transform group-hover:translate-x-1",
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          )} />
        </div>
      </div>
    </div>
  )
}

export const LearningPlatform = () => {
  const { theme } = useThemeStore()
  const { isAdmin } = useAdminStore()
  const [selectedTopic, setSelectedTopic] = useState<TopicId>('memecoins')
  const [lessons, setLessons] = useState<Record<TopicId, Lesson[]>>({} as Record<TopicId, Lesson[]>)
  const [showModal, setShowModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка уроков из Firebase
  const loadLessons = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching lessons from Firebase...')
      const lessonsData = await getAllLessons()
      console.log('Fetched lessons:', lessonsData.length)

      // Группировка по темам
      const grouped: Record<TopicId, Lesson[]> = {} as Record<TopicId, Lesson[]>
      TOPICS.forEach(topic => {
        grouped[topic.id as TopicId] = lessonsData
          .filter(l => l.topicId === topic.id)
          .sort((a, b) => a.lessonNumber - b.lessonNumber)
      })
      setLessons(grouped)
    } catch (err: any) {
      console.error('Error loading lessons:', err)
      setError(`Не удалось загрузить уроки: ${err.message || 'Ошибка сети или прав доступа'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLessons()
  }, [loadLessons])

  // Фильтрация уроков по поиску
  const filteredLessons = lessons[selectedTopic]?.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.comment?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Добавление/редактирование урока
  const handleSaveLesson = async (lessonData: Partial<Lesson> & { newVideoFiles?: File[]; newFileFiles?: File[] }) => {
    try {
      setLoading(true)
      const { newVideoFiles, newFileFiles, ...updates } = lessonData

      // Загрузка новых видео если они есть
      if (newVideoFiles?.length) {
        const uploadedVideos = await Promise.all(
          newVideoFiles.map(f => uploadFile(f, 'lessons/videos'))
        )
        const videoObjects = uploadedVideos.map(v => ({ url: v.url, name: v.fileName }))
        updates.videos = [...(updates.videos || []), ...videoObjects]
      }

      // Загрузка новых файлов если они есть
      if (newFileFiles?.length) {
        const uploadedFiles = await Promise.all(
          newFileFiles.map(f => uploadFile(f, 'lessons/files'))
        )
        const fileObjects = uploadedFiles.map(f => ({ url: f.url, name: f.fileName }))
        updates.files = [...(updates.files || []), ...fileObjects]
      }

      // Для обратной совместимости сохраняем первый элемент в старые поля
      if (updates.videos?.length) {
        updates.videoUrl = updates.videos[0].url
        updates.videoFileName = updates.videos[0].name
      }
      if (updates.files?.length) {
        updates.fileUrl = updates.files[0].url
        updates.fileName = updates.files[0].name
      }
      if (updates.youtubeUrls?.length) {
        updates.youtubeUrl = updates.youtubeUrls[0]
      }

      if (editingLesson) {
        // Редактирование существующего урока
        await updateLesson(editingLesson.id, updates)
      } else {
        // Добавление нового урока
        await addLesson({
          ...updates,
          topicId: updates.topicId as LessonTopic,
          lessonNumber: updates.lessonNumber || 1,
          title: updates.title || '',
          resources: updates.resources || [],
        } as Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>)
      }

      // Перезагрузка уроков
      await loadLessons()
      setShowModal(false)
      setEditingLesson(null)
    } catch (err: any) {
      console.error('Error saving lesson:', err)
      const isStorageError = err.message?.includes('CORS') || err.message?.includes('Preflight')
      setError(`Не удалось сохранить урок: ${err.message || 'Неизвестная ошибка'}.${isStorageError ? ' Ошибка CORS в Firebase Storage. Убедитесь, что настроены правила доступа.' : ''}`)
    } finally {
      setLoading(false)
    }
  }

  // Удаление урока
  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm(`Вы уверены, что хотите удалить урок "${lesson.title}"?`)) {
      return
    }

    try {
      setLoading(true)
      // Удаление файлов из хранилища если они есть
      const deletePromises: Promise<void>[] = []

      if (lesson.videos?.length) {
        lesson.videos.forEach(v => deletePromises.push(deleteFile(v.url).catch(e => console.error('Error deleting video:', e))))
      } else if (lesson.videoUrl) {
        deletePromises.push(deleteFile(lesson.videoUrl).catch(e => console.error('Error deleting legacy video:', e)))
      }

      if (lesson.files?.length) {
        lesson.files.forEach(f => deletePromises.push(deleteFile(f.url).catch(e => console.error('Error deleting file:', e))))
      } else if (lesson.fileUrl) {
        deletePromises.push(deleteFile(lesson.fileUrl).catch(e => console.error('Error deleting legacy file:', e)))
      }

      await Promise.all(deletePromises)
      await deleteLesson(lesson.id)
      await loadLessons()
    } catch (err: any) {
      console.error('Error deleting lesson:', err)
      setError(`Не удалось удалить урок: ${err.message || 'Неизвестная ошибка'}`)
    } finally {
      setLoading(false)
    }
  }

  // Открытие модального окна для редактирования
  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setShowModal(true)
  }

  // Открытие модального окна для добавления
  const handleAddNew = () => {
    setEditingLesson(null)
    setShowModal(true)
  }

  const getTopicColor = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', gradient: 'from-emerald-500 to-teal-500' },
      pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20', gradient: 'from-pink-500 to-rose-500' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', gradient: 'from-purple-500 to-violet-500' },
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20', gradient: 'from-indigo-500 to-blue-500' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', gradient: 'from-amber-500 to-yellow-500' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', gradient: 'from-blue-500 to-cyan-500' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20', gradient: 'from-cyan-500 to-sky-500' },
    }
    return colors[color] || colors.emerald
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50'
    )}>
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-40 backdrop-blur-xl border-b",
        theme === 'dark' ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-gray-200'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h1 className={cn(
                  "text-2xl font-bold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Учебная платформа
                </h1>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                )}>
                  {TOPICS.find(t => t.id === selectedTopic)?.label || 'Все темы'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                )} />
                <input
                  type="text"
                  placeholder="Поиск уроков..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-64 pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus-emerald-500/50'
                      : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400 focus-emerald-500'
                  )}
                />
              </div>

              {/* Add Lesson Button - Только для админа */}
              {isAdmin && (
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Добавить урок</span>
                </button>
              )}
            </div>
          </div>

          {/* Topics */}
          <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
            {TOPICS.map((topic) => {
              const color = getTopicColor(topic.color)
              const isSelected = selectedTopic === topic.id
              const count = lessons[topic.id as TopicId]?.length || 0

              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                    isSelected
                      ? color.bg
                      : theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  )}
                >
                  <span className={isSelected ? color.text : ''}>
                    {topic.label}
                  </span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-xs",
                    isSelected
                      ? color.bg.replace('/10', '/20')
                      : theme === 'dark' ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-600'
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className={cn(
              "w-8 h-8 animate-spin",
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            )} />
          </div>
        ) : filteredLessons.length === 0 ? (
          // Empty state
          <div className={cn(
            "flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed",
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          )}>
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
              theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
            )}>
              <BookOpen className={cn(
                "w-10 h-10",
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              )} />
            </div>
            <h3 className={cn(
              "text-xl font-bold mb-2",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {searchQuery ? 'Уроки не найдены' : 'Пока нет уроков'}
            </h3>
            <p className={cn(
              "text-center max-w-md",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              {searchQuery
                ? 'Попробуйте изменить поисковый запрос'
                : isAdmin
                  ? 'Добавьте первый урок, нажав на кнопку выше'
                  : 'Скоро здесь появятся новые уроки'}
            </p>
          </div>
        ) : (
          // Lessons Grid
          <div className="grid gap-4">
            {filteredLessons.map((lesson) => {
              const topic = TOPICS.find(t => t.id === lesson.topicId)
              const topicColor = topic ? getTopicColor(topic.color) : getTopicColor('emerald')

              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  topicColor={topicColor}
                  onEdit={() => handleEdit(lesson)}
                  onDelete={() => handleDeleteLesson(lesson)}
                  canEdit={isAdmin}
                  theme={theme}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <LessonModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingLesson(null)
        }}
        onSave={handleSaveLesson}
        editingLesson={editingLesson}
        topics={TOPICS}
        theme={theme}
      />
    </div>
  )
}

export default LearningPlatform