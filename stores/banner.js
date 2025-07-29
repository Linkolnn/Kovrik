import { defineStore } from 'pinia'
import bannerData from '@/data/banner.json'

export const useBannerStore = defineStore('banner', {
  state: () => ({
    categories: bannerData.categories || {}
  }),

  getters: {
    /**
     * Получить данные категории по её названию
     * @param {string} categoryName - название категории
     * @returns {Object|null} данные категории или null
     */
    getCategoryData: (state) => (categoryName) => {
      if (!categoryName) return null
      
      // Ищем категорию по названию (точное совпадение)
      const category = state.categories[categoryName]
      if (category) return category
      
      // Если не найдено, возвращаем default категорию
      return state.categories.default || null
    },

    /**
     * Получить медиа-файл для категории
     * @param {string} categoryName - название категории
     * @returns {string} путь к медиа-файлу
     */
    getCategoryMedia: (state) => (categoryName) => {
      const categoryData = state.categories[categoryName] || state.categories.default
      return categoryData?.media || '/images/categories/default.jpg'
    },

    /**
     * Получить alt-текст для категории
     * @param {string} categoryName - название категории
     * @returns {string} alt-текст
     */
    getCategoryAlt: (state) => (categoryName) => {
      const categoryData = state.categories[categoryName] || state.categories.default
      return categoryData?.alt || 'Строительные материалы'
    },

    /**
     * Проверить, является ли медиа-файл видео
     * @param {string} mediaPath - путь к медиа-файлу
     * @returns {boolean} true если это видео
     */
    isVideoFile: () => (mediaPath) => {
      if (!mediaPath) return false
      const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov']
      const extension = mediaPath.split('.').pop()?.toLowerCase()
      return videoExtensions.includes(extension)
    },

    /**
     * Получить все доступные категории
     * @returns {Array} массив категорий
     */
    getAllCategories: (state) => {
      return Object.keys(state.categories)
        .filter(key => key !== 'default')
        .map(key => ({
          key,
          ...state.categories[key]
        }))
    }
  },

  actions: {
    /**
     * Обновить данные категорий (для будущего использования)
     * @param {Object} newCategories - новые данные категорий
     */
    updateCategories(newCategories) {
      this.categories = { ...this.categories, ...newCategories }
    },

    /**
     * Добавить новую категорию
     * @param {string} key - ключ категории
     * @param {Object} categoryData - данные категории
     */
    addCategory(key, categoryData) {
      this.categories[key] = categoryData
    },

    /**
     * Удалить категорию
     * @param {string} key - ключ категории
     */
    removeCategory(key) {
      if (key !== 'default' && this.categories[key]) {
        delete this.categories[key]
      }
    },

    /**
     * Проверить существование медиа-файла
     * @param {string} mediaPath - путь к медиа-файлу
     * @returns {Promise<boolean>} промис с результатом проверки
     */
    async checkMediaExists(mediaPath) {
      try {
        const response = await fetch(mediaPath, { 
          method: 'HEAD',
          cache: 'no-store'
        })
        return response.ok
      } catch (error) {
        console.warn(`Не удалось проверить файл: ${mediaPath}`, error)
        return false
      }
    }
  }
})