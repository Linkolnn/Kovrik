<template>
  <div class="category-page">
    <div class="container">
      <!-- Category Banner -->
      <Banner :category-name="categoryName">
        <h1 class="category-page__title font-h1">{{ categoryName }}</h1>
        <p class="category-page__description font-text_medium">Широкий выбор товаров для вашего ремонта</p>
      </Banner>

      <!-- Filters Section -->
      <div class="category-page__filters">
        <ProductFilters 
          :category="categoryName" 
          :products="categoryProducts" 
          @filtered-products="handleFilteredProducts"
        />
      </div>

      <!-- Products Grid -->
      <div class="category-page__products" ref="productsContainer">
        <div class="products-grid">
          <ProductCard 
            v-for="product in paginatedProducts" 
            :key="product.id" 
            :product="product" 
            :category-name="categoryName" 
          />
        </div>
        
        <!-- Loading indicator -->
        <div v-if="isLoading" class="loading-indicator">
          <div class="loading-spinner"></div>
        </div>
        
        <!-- No products message -->
        <div v-if="displayProducts.length === 0 && !isLoading" class="no-products">
          <p>Товары не найдены</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProductsStore } from '@/stores/products'
import { useNavigationStore } from '@/stores/navigation'
import { useBannerStore } from '@/stores/banner'

const route = useRoute()
const navigationStore = useNavigationStore()
const productsStore = useProductsStore()
const bannerStore = useBannerStore()

// State
const displayProducts = ref([])
const currentPage = ref(1)
const isLoading = ref(false)
const productsContainer = ref(null)
const isMobile = ref(false)

// Computed
const categoryUrl = computed(() => route.params.category)
const category = computed(() => navigationStore.getCategoryByUrl(`/${categoryUrl.value}`))
const categoryName = computed(() => category.value?.name || 'Категория')

// Adaptive items per page based on screen size
const itemsPerPage = computed(() => {
  return isMobile.value ? 5 : 8
})

// Get products from the store
const categoryProducts = computed(() => {
  if (categoryName.value) {
    return productsStore.getProductsByCategory(categoryName.value)
  }
  return []
})

// Paginated products (currently visible products)
const paginatedProducts = computed(() => {
  const endIndex = currentPage.value * itemsPerPage.value
  return displayProducts.value.slice(0, endIndex)
})

// Check if we've reached the end of products
const hasReachedEnd = computed(() => {
  return paginatedProducts.value.length >= displayProducts.value.length && displayProducts.value.length > 0
})

// Check if screen is mobile
const checkMobileScreen = () => {
  if (process.client) {
    isMobile.value = window.innerWidth <= 859
  }
}

// Load more products
const loadMoreProducts = async () => {
  if (isLoading.value || hasReachedEnd.value) return
  
  isLoading.value = true
  
  // Simulate loading delay (remove this in production)
  await new Promise(resolve => setTimeout(resolve, 500))
  
  currentPage.value++
  isLoading.value = false
}

// Intersection Observer for infinite scroll
let observer = null

const setupIntersectionObserver = () => {
  if (!productsContainer.value) return
  
  const options = {
    root: null,
    rootMargin: '80px', // Start loading 80px before reaching the bottom
    threshold: 0.1
  }
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasReachedEnd.value) {
        loadMoreProducts()
      }
    })
  }, options)
  
  // Create a sentinel element at the bottom of the products container
  const sentinel = document.createElement('div')
  sentinel.style.height = '1px'
  sentinel.classList.add('scroll-sentinel')
  productsContainer.value.appendChild(sentinel)
  
  observer.observe(sentinel)
}

// Clean up observer
const cleanupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  
  // Remove sentinel element
  const sentinel = productsContainer.value?.querySelector('.scroll-sentinel')
  if (sentinel) {
    sentinel.remove()
  }
}

// Handle filtered products
function handleFilteredProducts(filteredProducts) {
  displayProducts.value = filteredProducts
  currentPage.value = 1 // Reset pagination when filters change
  
  // Cleanup and setup observer again
  nextTick(() => {
    cleanupObserver()
    setupIntersectionObserver()
  })
}

// Handle screen resize
const handleResize = () => {
  const wasMobile = isMobile.value
  checkMobileScreen()
  
  // If screen size category changed, recalculate pagination
  if (wasMobile !== isMobile.value) {
    // Recalculate current page based on currently shown products
    const currentlyShown = paginatedProducts.value.length
    currentPage.value = Math.ceil(currentlyShown / itemsPerPage.value) || 1
  }
}

// Initialize products when they load
watch(() => categoryProducts.value, (newProducts) => {
  if (newProducts.length > 0 && displayProducts.value.length === 0) {
    displayProducts.value = newProducts
    currentPage.value = 1
    
    nextTick(() => {
      setupIntersectionObserver()
    })
  }
}, { immediate: true })

// Setup observer and resize listener on mount
onMounted(() => {
  checkMobileScreen()
  
  nextTick(() => {
    setupIntersectionObserver()
  })
  
  if (process.client) {
    window.addEventListener('resize', handleResize)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  cleanupObserver()
  
  if (process.client) {
    window.removeEventListener('resize', handleResize)
  }
})

// Watch for route changes to reset pagination
watch(() => route.params.category, () => {
  currentPage.value = 1
  displayProducts.value = []
  cleanupObserver()
})

// Page title and meta
useHead(() => {
  // Получаем медиа-файл для Open Graph
  const categoryMedia = bannerStore.getCategoryMedia(categoryName.value)
  const categoryAlt = bannerStore.getCategoryAlt(categoryName.value)
  
  return {
    title: `${categoryName.value} - магазин КОВРИК`,
    meta: [
      { name: 'description', content: `${categoryName.value} в Урае - широкий выбор товаров в магазине КОВРИК по адресу: г. Урай мкр 1Д, дом 75А. Доступные цены, качественные товары.` },
      { name: 'keywords', content: `${categoryName.value} Урай, купить ${categoryName.value.toLowerCase()} в Урае, магазин ${categoryName.value.toLowerCase()} Урай, КОВРИК Урай` },
      { property: 'og:title', content: `${categoryName.value} Урай - магазин КОВРИК` },
      { property: 'og:description', content: categoryAlt },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `https://vizit-uray.vercel.app/${categoryUrl.value}` },
      { property: 'og:image', content: categoryMedia.endsWith('.jpg') || categoryMedia.endsWith('.png') ? categoryMedia : '/images/categories/default.jpg' }
    ]
  }
})
</script>

<style lang="sass">
@import '@color'
@import '@mixin'

.category-page
  padding: 30px 0

.category-page__title
  margin: 0 0 10px
  color: $white

.category-page__description
  margin: 0
  color: $white
  opacity: 0.9
  max-width: 600px

.category-page__filters
  margin-bottom: 30px
  border-radius: 8px
  overflow: visible

.category-page__products
  position: relative

.products-grid
  display: grid
  grid-template-columns: repeat(4, 1fr)
  gap: 20px
  
  @include tablet
    grid-template-columns: repeat(2, 1fr)
  
  @include mobile
    grid-template-columns: 1fr

.loading-indicator
  display: flex
  flex-direction: column
  align-items: center
  padding: 30px 0
  
  .loading-spinner
    width: 30px
    height: 30px
    border: 3px solid $black
    border-top: 3px solid $gray-dark
    border-radius: 50%
    animation: spin 1s linear infinite

.no-products
  text-align: center
  padding: 60px 0
  color: #666
  font-size: 18px
  
  p
    margin: 0

@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

@include tablet
  .filters
    flex-wrap: wrap
    gap: 15px

@include mobile
  .category-page__filters
    margin-bottom: 20px
  
  .filters
    flex-direction: column
    gap: 10px
  
  .filters__group
    width: 100%
    justify-content: space-between
    
  .loading-indicator
    padding: 20px 0
    
    .loading-spinner
      width: 30px
      height: 30px
    
    p
      font-size: 14px
</style>