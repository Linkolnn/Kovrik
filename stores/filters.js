import { defineStore } from 'pinia';
import filtersData from '@/data/filters.json';

export const useFiltersStore = defineStore('filters', {
  state: () => ({
    // Опции фильтрации
    sortOptions: filtersData.sortOptions,
    groupOptions: filtersData.groupOptions,
    
    // Выбранные значения фильтров
    selectedSort: 'price-asc',
    selectedGroups: [],
    selectedManufacturers: [],
    
    // Поиск
    searchQuery: '',
    
    // Состояние открытых фильтров
    openFilters: {
      sort: false,
      group: false,
      manufacturer: false
    },
    
    // Текущая категория
    currentCategory: '',
    
    // Опции производителей (динамически формируются)
    manufacturerOptions: []
  }),
  
  getters: {
    // Получение опций группировки для текущей категории
    currentGroupOptions: (state) => {
      return state.groupOptions[state.currentCategory] || [];
    },
    
    // Вычисляемые свойства для отображения выбранных фильтров
    selectedSortLabel: (state) => {
      const option = state.sortOptions.find(opt => opt.value === state.selectedSort);
      return option ? option.label : '';
    },
    
    selectedGroupsLabel: (state) => {
      if (state.selectedGroups.length === 0) return 'Все';
      
      const groupOptions = state.groupOptions[state.currentCategory] || [];
      if (state.selectedGroups.length === groupOptions.length) return 'Все';
      
      return state.selectedGroups.map(value => {
        const option = groupOptions.find(opt => opt.value === value);
        return option ? option.label : '';
      }).join(', ');
    },
    
    selectedManufacturersLabel: (state) => {
      if (state.selectedManufacturers.length === 0) return 'Все';
      
      if (state.selectedManufacturers.length > 2) {
        return `Выбрано: ${state.selectedManufacturers.length}`;
      }
      
      return state.selectedManufacturers.join(', ');
    },
    
    // Получение активных фильтров для применения к продуктам
    activeFilters: (state) => {
      return {
        sort: state.selectedSort,
        groups: state.selectedGroups,
        manufacturers: state.selectedManufacturers,
        search: state.searchQuery
      };
    }
  },
  
  actions: {
    // Установка текущей категории
    setCategory(category) {
      this.currentCategory = category;
      this.selectedGroups = [];
      this.selectedManufacturers = [];
    },
    
    // Установка опций производителей
    setManufacturerOptions(options) {
      this.manufacturerOptions = options;
    },
    
    // Установка поискового запроса
    setSearchQuery(query) {
      this.searchQuery = query;
    },
    
    // Обновление выбранных фильтров
    updateFilters(filters) {
      if (filters.sort !== undefined) this.selectedSort = filters.sort;
      if (filters.groups !== undefined) this.selectedGroups = filters.groups;
      if (filters.manufacturers !== undefined) this.selectedManufacturers = filters.manufacturers;
      if (filters.search !== undefined) this.searchQuery = filters.search;
    },
    
    // Переключение состояния фильтра (открыт/закрыт)
    toggleFilter(filterName) {
      const wasOpen = this.openFilters[filterName];
      
      // Закрываем все фильтры
      Object.keys(this.openFilters).forEach(key => {
        this.openFilters[key] = false;
      });
      
      // Если фильтр был закрыт, открываем его
      if (!wasOpen) {
        this.openFilters[filterName] = true;
      }
    },
    
    // Функция поиска товаров
    searchProducts(products, query) {
      if (!query || !query.trim()) {
        return products;
      }

      const searchTerm = query.toLowerCase().trim();
      
      return products.filter(product => {
        // Поиск по названию
        const titleMatch = product.title?.toLowerCase().includes(searchTerm);
        
        // Поиск по описанию
        const descriptionMatch = product.description?.toLowerCase().includes(searchTerm);
        
        // Поиск по спецификациям
        let specificationsMatch = false;
        if (product.specifications) {
          specificationsMatch = Object.values(product.specifications).some(value => {
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchTerm);
            }
            return false;
          });
        }
        
        // Поиск по артикулу
        const articleMatch = product.article?.toLowerCase().includes(searchTerm);
        
        // Поиск по коллекции
        const collectionMatch = product.collection?.toLowerCase().includes(searchTerm);
        
        return titleMatch || descriptionMatch || specificationsMatch || articleMatch || collectionMatch;
      });
    },
    
    // Фильтрация продуктов
    filterProducts(products) {
      let result = [...products];
      
      // Применяем поиск сначала
      if (this.searchQuery && this.searchQuery.trim()) {
        result = this.searchProducts(result, this.searchQuery);
      }
      
      // Применяем сортировку
      switch (this.selectedSort) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'popular':
          // Логика сортировки по популярности
          break;
        case 'new':
          // Логика сортировки по новизне
          result.sort((a, b) => a.price - b.price);
          break;
      }
      
      // Применяем фильтрацию по группам
      if (this.selectedGroups.length > 0) {
        result = result.filter(product => {
          const productGroup = this.getProductGroup(product);
          return this.selectedGroups.includes(productGroup);
        });
      }
      
      // Применяем фильтрацию по производителям
      if (this.selectedManufacturers.length > 0) {
        result = result.filter(product => {
          const manufacturer = product.specifications?.Бренд || 
                              product.brand?.split('/').pop().replace('.jpg', '') || 
                              'Unknown';
          return this.selectedManufacturers.includes(manufacturer);
        });
      }
      
      return result;
    },
    
    // Определение группы товара в зависимости от категории
    getProductGroup(product) {
      // Явно получаем данные из filtersData через state
      const categoryGroups = this.groupOptions[this.currentCategory];
      
      if (!categoryGroups || !categoryGroups.length || !product.specifications) {
        return '';
      }

      // Получаем все возможные поля для поиска
      const searchFields = [
        product.specifications['Тип товара'],
        product.specifications['Материал'], 
        product.specifications['Основа'],
        product.specifications['Тип'],
        product.specifications['Категория'],
        product.name
      ]
        .filter(Boolean) // убираем undefined/null значения
        .map(field => field.toLowerCase());

      // Проходим по всем доступным группам из filters.json
      for (const group of categoryGroups) {
        const groupLabel = group.label.toLowerCase();
        
        // Ищем совпадения в полях товара с названием группы из filters.json
        const hasMatch = searchFields.some(field => {
          return field.includes(groupLabel);
        });

        if (hasMatch) {
          return group.value;
        }
      }

      return '';
    },

    // Сброс всех фильтров
    resetFilters() {
      this.selectedSort = 'price-asc';
      this.selectedGroups = [];
      this.selectedManufacturers = [];
      this.searchQuery = '';
      
      Object.keys(this.openFilters).forEach(key => {
        this.openFilters[key] = false;
      });
    }
  }
});