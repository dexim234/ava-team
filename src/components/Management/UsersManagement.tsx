import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, User, X, Image, Save, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { User as UserType, TEAM_MEMBERS, User as UserInterface } from '@/types'
import { getAllUsers, addUser, updateUser, deleteUser } from '@/services/firestoreService'
import { useAdminStore } from '@/store/adminStore'
import { useThemeStore } from '@/store/themeStore'
import { generateUserCredentials } from '@/utils/userUtils'

// Merge Firestore users with TEAM_MEMBERS (same logic as useUsers hook)
const mergeUsersWithTeamMembers = (firestoreUsers: UserInterface[]): UserInterface[] => {
  const usersMap = new Map<string, UserInterface>()

  // Add TEAM_MEMBERS first (as fallback/base)
  TEAM_MEMBERS.forEach(user => {
    usersMap.set(user.id, user)
  })

  // Override with Firestore users (new/updated users)
  firestoreUsers.forEach(user => {
    usersMap.set(user.id, user)
  })

  return Array.from(usersMap.values())
}

export const UsersManagement: React.FC = () => {
  const { theme } = useThemeStore()
  const { isAdmin } = useAdminStore()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    login: '',
    password: '',
    avatar: '',
    nickname: '',
    phone: '',
    recoveryCode: '',
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedCredentials, setGeneratedCredentials] = useState<{ login: string; password: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const firestoreUsers = await getAllUsers()
      const allUsers = mergeUsersWithTeamMembers(firestoreUsers)
      setUsers(allUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      // Fallback to TEAM_MEMBERS on error
      setUsers(TEAM_MEMBERS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.login || !formData.password) {
      alert('Заполните все обязательные поля')
      return
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData)
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: { userId: editingUser.id } }))
      } else {
        const newUserRef = await addUser({
          name: formData.name,
          login: formData.login,
          password: formData.password,
          nickname: formData.nickname || undefined,
          avatar: formData.avatar || undefined,
          phone: formData.phone || undefined,
          recoveryCode: formData.recoveryCode || undefined,
        })
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: { userId: newUserRef.id } }))
        // Clear generated credentials after successful add
        setGeneratedCredentials(null)
      }
      // Small delay to ensure Firestore has updated and the state is ready
      await new Promise(resolve => setTimeout(resolve, 800))
      await loadUsers()
      closeForm()
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Ошибка при сохранении пользователя')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit file size to 2MB before processing
    if (file.size > 2 * 1024 * 1024) {
      alert('Файл слишком большой. Выберите изображение до 2МБ')
      return
    }

    try {
      setUploading(true)

      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          // Create a canvas to resize the image to a reasonable size (200x200)
          // This keeps the Base64 string small enough for Firestore
          const canvas = document.createElement('canvas')
          const MAX_SIZE = 200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width
              width = MAX_SIZE
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height
              height = MAX_SIZE
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          // Get compressed Base64 string
          const base64String = canvas.toDataURL('image/jpeg', 0.7)
          setFormData(prev => ({ ...prev, avatar: base64String }))
          setUploading(false)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Ошибка при обработке изображения')
      setUploading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      if (confirm('Вы уверены, что хотите удалить этого пользователя? Это действие удалит все его данные (слоты, заработок, задачи, рейтинг и т.д.).')) {
        await deleteUser(userId)
        await loadUsers()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Ошибка при удалении пользователя')
    }
  }

  const openEditForm = (user: UserType) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      login: user.login,
      password: user.password,
      nickname: user.nickname || '',
      avatar: user.avatar || '',
      phone: user.phone || '',
      recoveryCode: user.recoveryCode || '',
    })
    setShowForm(true)
  }

  const openAddForm = () => {
    setEditingUser(null)
    const credentials = generateUserCredentials('', users)
    setFormData({ name: '', login: credentials.login, password: credentials.password, nickname: '', avatar: '', phone: '', recoveryCode: '' })
    setGeneratedCredentials(credentials)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingUser(null)
    setFormData({ name: '', login: '', password: '', nickname: '', avatar: '', phone: '', recoveryCode: '' })
    setGeneratedCredentials(null)
  }

  const regenerateCredentials = () => {
    // Get current users list for uniqueness check
    const currentUsers = users.length > 0 ? users : TEAM_MEMBERS
    const credentials = generateUserCredentials(formData.name || 'user', currentUsers)
    setFormData({ ...formData, login: credentials.login, password: credentials.password })
    setGeneratedCredentials(credentials)
  }

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }))
  }

  const copyCredentials = (login: string, password: string, userId: string) => {
    navigator.clipboard.writeText(`Логин: ${login}\nПароль: ${password}`)
    setCopiedId(userId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyLogin = (login: string) => {
    navigator.clipboard.writeText(login)
  }

  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const labelColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
  const hoverBg = theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
  const subTextColor = theme === 'dark' ? 'text-gray-500' : 'text-gray-400'

  if (!isAdmin) {
    return (
      <div className={`p-4 rounded-xl border ${cardBg} ${borderColor}`}>
        <p className={labelColor}>Доступ запрещён. Только для администраторов.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-bold ${headingColor}`}>Управление участниками</h2>
        <button
          onClick={openAddForm}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${theme === 'dark'
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
        >
          <Plus size={18} />
          Добавить участника
        </button>
      </div>

      {/* Users List */}
      {loading ? (
        <div className={`p-8 text-center ${labelColor}`}>Загрузка...</div>
      ) : users.length === 0 ? (
        <div className={`p-8 text-center rounded-xl border ${cardBg} ${borderColor}`}>
          <User className={`w-12 h-12 mx-auto mb-3 opacity-30 ${labelColor}`} />
          <p className={labelColor}>Нет участников. Добавьте первого!</p>
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${cardBg} ${borderColor}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${labelColor}`}>Участник</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${labelColor}`}>Никнейм</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${labelColor}`}>Телефон</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${labelColor}`}>Код восст.</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${labelColor}`}>Логин</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${labelColor}`}>Пароль</th>
                  <th className={`px-4 py-3 text-right text-sm font-semibold ${labelColor}`}>Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {users.map((user) => (
                  <tr key={user.id} className={hoverBg}>
                    <td className={`px-4 py-3 ${labelColor}`}>
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                            {user.name[0]}
                          </div>
                        )}
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 ${labelColor}`}>
                      <span className="text-sm">{user.nickname || '—'}</span>
                    </td>
                    <td className={`px-4 py-3 ${labelColor}`}>
                      <span className="text-sm">{user.phone || '—'}</span>
                    </td>
                    <td className={`px-4 py-3 ${labelColor}`}>
                      <span className="text-sm font-mono text-amber-500/80">{user.recoveryCode || '—'}</span>
                    </td>
                    <td className={`px-4 py-3 ${labelColor}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{user.login}</span>
                        <button
                          onClick={() => copyLogin(user.login)}
                          className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`}
                          title="Копировать логин"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className={`px-4 py-3 ${labelColor}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                          {showPasswords[user.id] ? user.password : '••••••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(user.id)}
                          className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`}
                          title={showPasswords[user.id] ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                          {showPasswords[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => copyCredentials(user.login, user.password, user.id)}
                          className={`p-1 rounded transition-colors ${copiedId === user.id ? 'text-emerald-500' : theme === 'dark' ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`}
                          title="Копировать учётные данные"
                        >
                          {copiedId === user.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm ${labelColor}`}>
                      {user.avatar ? (
                        <span className="text-emerald-500">Есть</span>
                      ) : (
                        <span className="text-gray-500">Нет</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right`}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(user)}
                          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          title="Редактировать"
                        >
                          <Edit2 size={16} />
                        </button>
                        {deleteConfirm === user.id ? (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                            title="Подтвердить удаление"
                          >
                            <Save size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'
                              }`}
                            title="Удалить"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {deleteConfirm === user.id && (
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                              }`}
                            title="Отмена"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-md ${cardBg} border-2 ${borderColor} shadow-2xl`}>
            <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-bold ${headingColor}`}>
                {editingUser ? 'Редактирование участника' : 'Новый участник'}
              </h3>
              <button
                onClick={closeForm}
                className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X size={20} className={labelColor} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${labelColor}`}>
                  Имя <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${theme === 'dark'
                    ? 'bg-[#2a2a2a] border-gray-700 text-white focus:border-emerald-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-500'
                    }`}
                  placeholder="Введите имя участника"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${labelColor}`}>
                  Никнейм (необязательно)
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${theme === 'dark'
                    ? 'bg-[#2a2a2a] border-gray-700 text-white focus:border-emerald-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-500'
                    }`}
                  placeholder="Введите никнейм"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelColor}`}>
                    Телефон
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${theme === 'dark'
                      ? 'bg-[#2a2a2a] border-gray-700 text-white focus:border-emerald-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-500'
                      }`}
                    placeholder="79001234567"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${labelColor}`}>
                    Код восстановления
                  </label>
                  <input
                    type="text"
                    value={formData.recoveryCode}
                    onChange={(e) => setFormData({ ...formData, recoveryCode: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${theme === 'dark'
                      ? 'bg-[#2a2a2a] border-gray-700 text-white focus:border-emerald-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-500'
                      }`}
                    placeholder="Код"
                  />
                </div>
              </div>

              {/* Credentials Section */}
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${labelColor}`}>Учётные данные для входа</span>
                  {!editingUser && (
                    <button
                      type="button"
                      onClick={regenerateCredentials}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                    >
                      <RefreshCw size={12} />
                      Сгенерировать заново
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                      Логин <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.login}
                        onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark'
                          ? 'bg-[#2a2a2a] border-gray-700 text-white focus:border-emerald-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                          }`}
                        placeholder="login"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${subTextColor}`}>
                      Пароль <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords['form'] ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark'
                          ? 'bg-[#2a2a2a] border-gray-700 text-white focus:border-emerald-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                          }`}
                        placeholder="••••••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, form: !prev.form }))}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-500'}`}
                      >
                        {showPasswords['form'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Show generated credentials info for new users */}
                  {!editingUser && generatedCredentials && (
                    <div className={`text-xs p-2 rounded-lg ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                      Учётные данные сгенерированы автоматически. Скопируйте их перед закрытием формы.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${labelColor}`}>
                  Фото участника
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 border-dashed ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
                        }`}>
                        <User className={subTextColor} />
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={`w-full px-4 py-2 rounded-xl text-sm font-bold transition-all ${theme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        } border ${borderColor} flex items-center justify-center gap-2`}
                    >
                      {uploading ? 'Загрузка...' : formData.avatar ? 'Изменить фото' : 'Загрузить фото'}
                      {!uploading && <Image size={16} />}
                    </button>
                    <p className={`mt-1 text-[10px] ${subTextColor}`}>
                      Рекомендуется квадратное изображение (JPG, PNG)
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${theme === 'dark'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                >
                  {editingUser ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}