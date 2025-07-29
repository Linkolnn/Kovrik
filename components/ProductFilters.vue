<template>
  <div class="product-filters">
    <!-- Поисковая строка -->
    <div class="search-group">
      <div class="search-input-wrapper">
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="handleSearchInput"
          placeholder="Поиск товаров..."
          class="search-input"
        >
        <div class="search-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 14L11.06 11.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div 
          v-if="searchQuery" 
          class="search-clear"
          @click="clearSearch"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 3.5L3.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div v-if="searchQuery && searchResultsCount !== null" class="search-results-info">
        Найдено товаров: {{ searchResultsCount }}
      </div>
    </div>

    <!-- Сортировка -->
    <div class="filter-group">
      <div class="filter-header" @click="toggleFilter('sort')">
        <h3 class="filter-title">Сортировка: <span>{{ filtersStore.selectedSortLabel }}</span></h3>
        <div class="filter-toggle" :class="{ 'is-open': filtersStore.openFilters.sort }">
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div class="filter-dropdown" v-if="filtersStore.openFilters.sort">
        <div class="filter-options">
          <label v-for="option in filtersStore.sortOptions" :key="option.value" class="filter-option">
            <input 
              type="radio" 
              :value="option.value" 
              v-model="filtersStore.selectedSort" 
              @change="applyFilters"
            >
            <span class="radio-custom"></span>
            <span class="option-label">{{ option.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Группировка -->
    <div class="filter-group" v-if="filtersStore.currentGroupOptions.length > 0">
      <div class="filter-header" @click="toggleFilter('group')">
        <h3 class="filter-title">Группировка: <span>{{ filtersStore.selectedGroupsLabel }}</span></h3>
        <div class="filter-toggle" :class="{ 'is-open': filtersStore.openFilters.group }">
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div class="filter-dropdown" v-if="filtersStore.openFilters.group">
        <div class="filter-options">
          <label v-for="option in filtersStore.currentGroupOptions" :key="option.value" class="filter-option">
            <input 
              type="checkbox" 
              :value="option.value" 
              v-model="filtersStore.selectedGroups" 
              @change="applyFilters"
            >
            <span class="checkbox-custom"></span>
            <span class="option-label">{{ option.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Производитель -->
    <div class="filter-group" v-if="manufacturerOptions.length > 0">
      <div class="filter-header" @click="toggleFilter('manufacturer')">
        <h3 class="filter-title">Производитель: <span>{{ filtersStore.selectedManufacturersLabel }}</span></h3>
        <div class="filter-toggle" :class="{ 'is-open': filtersStore.openFilters.manufacturer }">
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div class="filter-dropdown" v-if="filtersStore.openFilters.manufacturer">
        <div class="filter-options">
          <label v-for="option in manufacturerOptions" :key="option.value" class="filter-option">
            <input 
              type="checkbox" 
              :value="option.value" 
              v-model="filtersStore.selectedManufacturers" 
              @change="applyFilters"
            >
            <span class="checkbox-custom"></span>
            <img v-if="option.logo" class="manufacturer-logo" :src="option.logo" :alt="option.label">
            <span class="option-label">
              {{ option.label }}
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useFiltersStore } from '@/stores/filters';

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  products: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['filtered-products']);

// Используем хранилище Pinia для фильтров
const filtersStore = useFiltersStore();

// Поисковая строка
const searchQuery = ref('');
const searchResultsCount = ref(null);

// Функция поиска товаров
function searchProducts(products, query) {
  if (!query.trim()) {
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
}

// Получаем опции производителей из списка товаров
const manufacturerOptions = computed(() => {
  const manufacturersMap = new Map();
  
  props.products.forEach(product => {
    // Извлекаем имя производителя из спецификаций
    const manufacturerName = product.specifications?.Бренд || 'Unknown';
    // Получаем логотип бренда из свойства brand
    const logoPath = product.brand || '';
    
    // Добавляем производителя в Map, если его еще нет
    if (!manufacturersMap.has(manufacturerName)) {
      manufacturersMap.set(manufacturerName, {
        name: manufacturerName,
        logo: logoPath
      });
    }
  });
  
  // Преобразуем Map в массив опций
  const options = Array.from(manufacturersMap.values()).map(manufacturer => {
    return {
      value: manufacturer.name,
      label: manufacturer.name,
      logo: manufacturer.logo
    };
  });
  
  // Обновляем опции производителей в store
  filtersStore.setManufacturerOptions(options);
  
  return options;
});

// Фильтрованные продукты с учетом поиска
const filteredProducts = computed(() => {
  // Сначала применяем поиск
  const searchFilteredProducts = searchProducts(props.products, searchQuery.value);
  
  // Затем применяем остальные фильтры
  const finalFilteredProducts = filtersStore.filterProducts(searchFilteredProducts);
  
  // Обновляем счетчик результатов поиска
  if (searchQuery.value.trim()) {
    searchResultsCount.value = finalFilteredProducts.length;
  } else {
    searchResultsCount.value = null;
  }
  
  return finalFilteredProducts;
});

// Методы
function toggleFilter(filterName) {
  filtersStore.toggleFilter(filterName);
}

function handleSearchInput() {
  applyFilters();
}

function clearSearch() {
  searchQuery.value = '';
  searchResultsCount.value = null;
  applyFilters();
}

function applyFilters() {
  // Эмитим отфильтрованные продукты в родительский компонент
  emit('filtered-products', filteredProducts.value);
}

// Устанавливаем текущую категорию при изменении
watch(() => props.category, (newCategory) => {
  filtersStore.setCategory(newCategory);
  applyFilters();
}, { immediate: true });

// Следим за изменениями продуктов
watch(() => props.products, () => {
  applyFilters();
}, { immediate: true });

// Следим за изменениями фильтров
watch(() => filtersStore.activeFilters, () => {
  applyFilters();
}, { deep: true });
</script>

<style lang="sass" scoped>
.product-filters
  width: 100%
  display: flex
  flex-direction: row
  justify-content: flex-start
  flex-wrap: wrap
  gap: 15px

.search-group
  @include tablet
      width: 100%
  .search-input-wrapper
    position: relative
    width: 100%
    
    .search-input
      width: 100%
      padding: 12px 45px 12px 40px
      border: 2px solid $gray
      border-radius: $radius
      background: $black
      font-size: 16px
      color: $white
      transition: border-color 0.2s ease, box-shadow 0.2s ease
      
      &:focus
        outline: none
        border-color: $border-dark
      
      &::placeholder
        color: $white
    
    .search-icon
      position: absolute
      left: 12px
      top: 50%
      transform: translateY(-45%)
      color: $white
      pointer-events: none
    
    .search-clear
      position: absolute
      right: 12px
      top: 50%
      transform: translateY(-45%)
      color: $white
      cursor: pointer
      padding: 2px
      border-radius: 50%
      transition: color 0.2s ease, background-color 0.2s ease
      
      &:hover
        color: #666
        background-color: #f5f5f5
  
  .search-results-info
    margin-top: 8px
    font-size: 14px
    color: #666
    font-style: italic

.filter-group
  position: relative
  
  &:last-child
    margin-right: 0

.filter-header
  display: flex
  justify-content: space-between
  align-items: center
  padding: 15px 10px
  cursor: pointer
  transition: background-color 0.2s ease
  white-space: nowrap
  
  &:hover
    opacity: 0.9

.filter-title
  font-size: 16px
  font-weight: 500
  margin: 0
  color: $black
  
  span
    color: #452CB7
    font-weight: 400
    margin-left: 5px

.filter-toggle
  transition: transform 0.3s ease
  margin-left: 8px
  
  &.is-open
    transform: rotate(180deg)

.filter-dropdown
  position: absolute
  top: 100%
  left: 0
  z-index: 100
  background-color: $black
  border-radius: 8px
  overflow: hidden
  min-width: 200px
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3)
  margin-top: 5px
  max-width: 235px
  
  .filter-options
    padding: 10px
    max-height: 300px
    overflow-y: auto

.filter-option
  display: flex
  align-items: center
  margin-bottom: 12px
  cursor: pointer
  color: white
  
  &:last-child
    margin-bottom: 0
  
  input[type="radio"],
  input[type="checkbox"]
    position: absolute
    opacity: 0
    height: 0
    width: 0

.radio-custom,
.checkbox-custom
  position: relative
  display: inline-block
  width: 20px
  height: 20px
  min-width: 20px
  margin-right: 10px
  border: 2px solid #444
  background-color: #333
  transition: all 0.2s ease

.radio-custom
  border-radius: 50%
  
  &:after
    content: ""
    position: absolute
    display: none
    top: 4px
    left: 4px
    width: 8px
    height: 8px
    border-radius: 50%
    background: $white

.checkbox-custom
  border-radius: 4px
  
  &:after
    content: ""
    position: absolute
    display: none
    left: 6px
    top: 0px
    width: 5px
    height: 10px
    border: solid $white
    border-width: 0 2px 2px 0
    transform: rotate(45deg)

input[type="radio"]:checked ~ .radio-custom,
input[type="checkbox"]:checked ~ .checkbox-custom
  border-color: $white
  background-color: #222

input[type="radio"]:checked ~ .radio-custom:after,
input[type="checkbox"]:checked ~ .checkbox-custom:after
  display: block

.option-label
  font-size: 14px
  display: flex
  align-items: center
  color: white

.manufacturer-logo
  display: inline-block
  max-width: 50%
  height: 24px
  margin-right: 5px
  border-radius: 3px
  object-fit: contain

@include mobile
  .filter-group
    width: 100%
  
  .search-group
    .search-input-wrapper
      max-width: 100%
</style>