import { useEffect } from 'react'

export const MemeEvaluation = () => {
  useEffect(() => {
    // Load the checklist functionality
    const loadChecklist = () => {
      const checkboxes = document.querySelectorAll('.meme-checkbox')
      const progressFill = document.getElementById('meme-progress-fill')
      const checkedCount = document.getElementById('meme-checked-count')
      const totalCount = document.getElementById('meme-total-count')
      const progressPercentage = document.getElementById('meme-progress-percentage')

      if (!checkboxes.length || !progressFill || !checkedCount || !totalCount || !progressPercentage) return

      totalCount.textContent = checkboxes.length
      loadProgress()

      // Add event listeners for checkboxes
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateProgress)
      })
    }

    const updateProgress = () => {
      const checkboxes = document.querySelectorAll('.meme-checkbox')
      const checkedBoxes = document.querySelectorAll('.meme-checkbox:checked')
      const progressFill = document.getElementById('meme-progress-fill')
      const checkedCount = document.getElementById('meme-checked-count')
      const progressPercentage = document.getElementById('meme-progress-percentage')

      if (!progressFill || !checkedCount || !progressPercentage) return

      const checkedCountValue = checkedBoxes.length
      const totalCountValue = checkboxes.length
      const percentage = Math.round((checkedCountValue / totalCountValue) * 100)

      // Update counters
      checkedCount.textContent = checkedCountValue
      progressPercentage.textContent = percentage + '%'

      // Animate progress bar
      progressFill.style.width = percentage + '%'

      // Add/remove completed class for items
      checkboxes.forEach(checkbox => {
        const item = checkbox.closest('.meme-item')
        if (checkbox.checked) {
          item?.classList.add('completed')
        } else {
          item?.classList.remove('completed')
        }
      })

      // Save progress to localStorage
      saveProgress()
    }

    const saveProgress = () => {
      const checkboxes = document.querySelectorAll('.meme-checkbox')
      const checkedStates: { [key: string]: boolean } = {}
      checkboxes.forEach(checkbox => {
        const cb = checkbox as HTMLInputElement
        checkedStates[cb.id] = cb.checked
      })
      localStorage.setItem('memeChecklistProgress', JSON.stringify(checkedStates))
    }

    const loadProgress = () => {
      const checkboxes = document.querySelectorAll('.meme-checkbox')
      const savedProgress = localStorage.getItem('memeChecklistProgress')
      if (savedProgress) {
        const checkedStates = JSON.parse(savedProgress)
        checkboxes.forEach(checkbox => {
          const cb = checkbox as HTMLInputElement
          if (checkedStates[cb.id]) {
            cb.checked = true
            cb.closest('.meme-item')?.classList.add('completed')
          }
        })
        // Update display after loading
        updateProgressDisplay()
      }
    }

    const updateProgressDisplay = () => {
      const checkboxes = document.querySelectorAll('.meme-checkbox')
      const checkedBoxes = document.querySelectorAll('.meme-checkbox:checked')
      const progressFill = document.getElementById('meme-progress-fill')
      const checkedCount = document.getElementById('meme-checked-count')
      const progressPercentage = document.getElementById('meme-progress-percentage')

      if (!progressFill || !checkedCount || !progressPercentage) return

      const checkedCountValue = checkedBoxes.length
      const totalCountValue = checkboxes.length
      const percentage = Math.round((checkedCountValue / totalCountValue) * 100)

      checkedCount.textContent = checkedCountValue
      progressPercentage.textContent = percentage + '%'
      progressFill.style.width = percentage + '%'
    }

    const resetProgress = () => {
      const checkboxes = document.querySelectorAll('.meme-checkbox')
      checkboxes.forEach(checkbox => {
        const cb = checkbox as HTMLInputElement
        cb.checked = false
        cb.closest('.meme-item')?.classList.remove('completed')
      })
      localStorage.removeItem('memeChecklistProgress')
      updateProgressDisplay()
    }

    // Add reset button functionality
    const resetButton = document.getElementById('meme-reset-button')
    if (resetButton) {
      resetButton.addEventListener('click', resetProgress)
    }

    // Add smooth scrolling to stages
    document.querySelectorAll('.meme-stage-title').forEach(title => {
      title.addEventListener('click', function() {
        const stage = this.closest('.meme-stage')
        stage?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })

    // Add intersection observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('style', 'opacity: 1; transform: translateY(0);')
        }
      })
    }, observerOptions)

    // Apply animation to all stages
    document.querySelectorAll('.meme-stage').forEach(stage => {
      stage.setAttribute('style', 'opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease;')
      observer.observe(stage)
    })

    loadChecklist()
  }, [])

  return (
    <div className="page-shell">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4E6E49]/20 to-[#4E6E49]/10 border border-[#4E6E49]/30 flex items-center justify-center">
              <span className="text-2xl">🐊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Оценка мемкоина
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Полный чек-лист проверки мемкоина
              </p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="glass-panel rounded-2xl p-6 mb-8 border border-[#4E6E49]/20">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-2xl animate-bounce">🐊</span>
            <h3 className="text-xl font-semibold text-[#4E6E49] dark:text-[#4E6E49]">
              Прогресс проверки
            </h3>
            <span className="text-2xl animate-bounce">🐊</span>
          </div>

          <div className="mb-4">
            <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-[#4E6E49]/30">
              <div
                id="meme-progress-fill"
                className="h-full bg-gradient-to-r from-[#4E6E49] to-[#6b8f5f] transition-all duration-800 ease-out relative"
              >
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-sm opacity-0 animate-pulse">
                  🐊
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <span id="meme-checked-count" className="text-2xl font-bold text-[#4E6E49]">0</span>
            <span className="text-gray-600 dark:text-gray-300">/</span>
            <span id="meme-total-count" className="text-2xl font-bold text-[#4E6E49]">0</span>
            <span className="text-gray-600 dark:text-gray-300 ml-2">пунктов выполнено</span>
          </div>

          <div className="text-center">
            <div id="meme-progress-percentage" className="text-4xl font-bold text-[#4E6E49] mb-4">0%</div>
          </div>

          <div className="text-center">
            <button
              id="meme-reset-button"
              className="bg-gradient-to-r from-[#4E6E49]/10 to-[#4E6E49]/5 hover:from-[#4E6E49] hover:to-[#6b8f5f] text-[#4E6E49] hover:text-white border border-[#4E6E49] px-6 py-2 rounded-full transition-all duration-300 font-semibold"
            >
              🗑️ Сбросить прогресс
            </button>
          </div>
        </div>

        {/* Checklist Stages */}
        <div className="space-y-6">
          {/* Stage 1 */}
          <div className="meme-stage glass-panel rounded-2xl border border-[#4E6E49]/20 overflow-hidden">
            <div className="bg-gradient-to-r from-[#4E6E49] to-[#6b8f5f] p-6">
              <h2 className="meme-stage-title text-xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity">
                Этап №1 – оценка базовых метрик (первичный фильтр)
              </h2>
              <p className="text-white/90 mt-2">
                Цель: убрать мусор, скам и неподходящие ранние фазы.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Checklist items */}
              <div className="meme-item flex items-start gap-4 p-4 rounded-lg hover:bg-[#4E6E49]/5 transition-colors">
                <input type="checkbox" id="meme-1-1" className="meme-checkbox w-5 h-5 mt-1 accent-[#4E6E49] rounded" />
                <label htmlFor="meme-1-1" className="flex-1 cursor-pointer">
                  <strong className="text-[#4E6E49] font-semibold block mb-2">Market Cap</strong>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>• Капа ≤ 100k (оптимально 20–80k).</li>
                    <li>• Резкий скачок капы на старте без реальной ликвидности — минус.</li>
                  </ul>
                </label>
              </div>

              <div className="meme-item flex items-start gap-4 p-4 rounded-lg hover:bg-[#4E6E49]/5 transition-colors">
                <input type="checkbox" id="meme-1-2" className="meme-checkbox w-5 h-5 mt-1 accent-[#4E6E49] rounded" />
                <label htmlFor="meme-1-2" className="flex-1 cursor-pointer">
                  <strong className="text-[#4E6E49] font-semibold block mb-2">Объём торгов</strong>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>• Объём > капы в 1.5–2 раза (лучше 2.5–3).</li>
                    <li>• Проверить синхронность: объём должен совпадать с движением цены.</li>
                  </ul>
                </label>
              </div>

              <div className="meme-item flex items-start gap-4 p-4 rounded-lg hover:bg-[#4E6E49]/5 transition-colors">
                <input type="checkbox" id="meme-1-3" className="meme-checkbox w-5 h-5 mt-1 accent-[#4E6E49] rounded" />
                <label htmlFor="meme-1-3" className="flex-1 cursor-pointer">
                  <strong className="text-[#4E6E49] font-semibold block mb-2">Холдеры</strong>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>• Рост холдеров стабильный, без искусственных всплесков.</li>
                    <li>• Проверить уникальность кошельков.</li>
                  </ul>
                </label>
              </div>

              <div className="meme-item flex items-start gap-4 p-4 rounded-lg hover:bg-[#4E6E49]/5 transition-colors">
                <input type="checkbox" id="meme-1-4" className="meme-checkbox w-5 h-5 mt-1 accent-[#4E6E49] rounded" />
                <label htmlFor="meme-1-4" className="flex-1 cursor-pointer">
                  <strong className="text-[#4E6E49] font-semibold block mb-2">График</strong>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>• Органичный график, без параболического роста.</li>
                    <li>• Нет вертикальных ракет на старте.</li>
                  </ul>
                </label>
              </div>

              <div className="meme-item flex items-start gap-4 p-4 rounded-lg hover:bg-[#4E6E49]/5 transition-colors">
                <input type="checkbox" id="meme-1-5" className="meme-checkbox w-5 h-5 mt-1 accent-[#4E6E49] rounded" />
                <label htmlFor="meme-1-5" className="flex-1 cursor-pointer">
                  <strong className="text-[#4E6E49] font-semibold block mb-2">Ликвидность</strong>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>• Ликвидность > 15k (лучше 25–40k).</li>
                    <li>• Проверить соотношение ликвидности к капе.</li>
                  </ul>
                </label>
              </div>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="meme-stage glass-panel rounded-2xl border border-[#4E6E49]/20 overflow-hidden">
            <div className="bg-gradient-to-r from-[#4E6E49] to-[#6b8f5f] p-6">
              <h2 className="meme-stage-title text-xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity">
                Этап №2 – анализ бандлов (MEV-активности)
              </h2>
              <p className="text-white/90 mt-2">
                Цель: понять, насколько токен находится под контролем бандлеров.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="meme-item flex items-start gap-4 p-4 rounded-lg hover:bg-[#4E6E49]/5 transition-colors">
                <input type="checkbox" id="meme-2-1" className="meme-checkbox w-5 h-5 mt-1 accent-[#4E6E49] rounded" />
                <label htmlFor="meme-2-1" className="flex-1 cursor-pointer">
                  <strong className="text-[#4E6E49] font-semibold block mb-2">Откуплено бандлами</strong>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>• ≤ 100, максимум 200 SOL за весь период.</li>
                  </ul>
                </label>
              </div>

              <div className="meme-item flex items-start gap-4 p-4 rounded-lg hover:bg-[#4E6E49]/5 transition-colors">
                <input type="checkbox" id="meme-2-2" className="meme-checkbox w-5 h-5 mt-1 accent-[#4E6E49] rounded" />
                <label htmlFor="meme-2-2" className="flex-1 cursor-pointer">
                  <strong className="text-[#4E6E49] font-semibold block mb-2">Остаток бандлов</strong>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>• ≤ 30 SOL.</li>
                  </ul>
                </label>
              </div>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="meme-stage glass-panel rounded-2xl border border-[#4E6E49]/20 overflow-hidden">
            <div className="bg-gradient-to-r from-[#4E6E49] to-[#6b8f5f] p-6">
              <h2 className="meme-stage-title text-xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity">
                Этап №3 – Твиттер, комьюнити и сайт
              </h2>
              <p className="text-white/90 mt-2">
                Цель: убедиться, что есть органика, а не полностью фейковая оболочка.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="meme-item flex items-start gap-4 p-4 rounded-lg hover:bg-[#4E6E49]/5 transition-colors">
                <input type="checkbox" id="meme-3-1" className="meme-checkbox w-5 h-5 mt-1 accent-[#4E6E49] rounded" />
                <label htmlFor="meme-3-1" className="flex-1 cursor-pointer">
                  <strong className="text-[#4E6E49] font-semibold block mb-2">Twitter</strong>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>• Посты каждые 1–3 минуты в первые часы.</li>
                    <li>• Рост подписчиков органичный.</li>
                  </ul>
                </label>
              </div>

              <div className="meme-item flex items-start gap-4 p-4 rounded-lg hover:bg-[#4E6E49]/5 transition-colors">
                <input type="checkbox" id="meme-3-2" className="meme-checkbox w-5 h-5 mt-1 accent-[#4E6E49] rounded" />
                <label htmlFor="meme-3-2" className="flex-1 cursor-pointer">
                  <strong className="text-[#4E6E49] font-semibold block mb-2">Сайт</strong>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>• Дизайн прикольный, ссылки рабочие.</li>
                  </ul>
                </label>
              </div>
            </div>
          </div>

          {/* Additional stages can be added here - showing abbreviated version for brevity */}
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Полная версия чек-листа включает ещё 4 этапа с детальными проверками DEV, контракта и риск-менеджмента.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .completed {
          background: rgba(78, 110, 73, 0.1) !important;
          border-left: 4px solid #4E6E49;
        }

        .meme-item.completed strong {
          color: #4E6E49;
        }

        .meme-checkbox:checked {
          background-color: #4E6E49;
          border-color: #4E6E49;
        }

        .meme-checkbox:checked::after {
          content: '🐊';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          color: white;
        }
      `}</style>
    </div>
  )
}
