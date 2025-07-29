<template>
  <div class="product-page">
    <div class="container">
      <!-- Breadcrumbs -->
      <div class="breadcrumbs mb-20">
        <NuxtLink to="/" class="breadcrumbs__link">Главная</NuxtLink>
        <span class="breadcrumbs__separator">/</span>
        <NuxtLink :to="categoryUrl" class="breadcrumbs__link">{{ categoryName }}</NuxtLink>
        <span class="breadcrumbs__separator">/</span>
        <span class="breadcrumbs__current">{{ product.title }}</span>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <div class="product-layout">
          <!-- Left column - Product Gallery and Details -->
          <div class="product-layout__main">
            <!-- Product Gallery -->
            <div class="product-gallery">
              <div class="product-gallery__main">
                <img 
                  :src="currentImage" 
                  :alt="product.title" 
                  class="product-gallery__image"
                >
              </div>
              <div v-if="product.gallery && product.gallery.length > 1" class="product-gallery__thumbs">
                <div 
                  v-for="(image, index) in product.gallery" 
                  :key="index" 
                  class="product-gallery__thumb"
                  :class="{ 'product-gallery__thumb--active': index === activeThumb }"
                  @click="setActiveThumb(index)"
                >
                  <img 
                    :src="image" 
                    :alt="`${product.title} - изображение ${index + 1}`"
                    @error="handleThumbError(index)"
                  >
                </div>
              </div>
            </div>
            
            <!-- Product Details -->
            <div class="product-details">
              <h1 class="product-details__title font-h2">{{ product.title }}</h1>
              
              <div class="product-details__meta">
                <div class="product-details__meta-item">
                  <span class="product-details__meta-label">Бренд:</span>
                  <img 
                    class="product-details__meta-value" 
                    :src="product.brand" 
                    :alt="`Логотип бренда ${product.collection || 'товара'}`"
                    @error="handleBrandError"
                  >
                </div>
                <div v-if="product.collection" class="product-details__meta-item">
                  <span class="product-details__meta-label">Коллекция:</span>
                  <span class="product-details__meta-value">{{ product.collection }}</span>
                </div>
                <div v-if="product.article" class="product-details__meta-item">
                  <span class="product-details__meta-label">Артикул:</span>
                  <span class="product-details__meta-value">{{ product.article }}</span>
                </div>
              </div>
              
              <div v-if="product.price" class="product-details__price-block">
                <p class="product-details__price">{{ formatPrice(product.price) }} ₽</p>
              </div>
            </div>
          </div>
          
          <!-- Right column - Specifications -->
          <div class="product-layout__specs">
            <div class="product-specs__actions product-specs__actions--mobile">
              <NuxtLink :to="social.telegram" class="consultation-btn">
                Бесплатная консультация
                <img src="/assets/icons/telegram.svg" alt="Telegram" class="consultation-btn__icon">
              </NuxtLink>
            </div>
            <div class="product-specs">
              <h3 class="product-specs__title">Характеристики</h3>
              <div class="product-specs__list">
                <div v-for="(value, key) in product.specifications" :key="key" class="product-specs__row">
                  <div class="product-specs__name">{{ key }}</div>
                  <div class="product-specs__value">{{ value }}</div>
                </div>
              </div>
              
              <div class="product-specs__actions product-specs__actions--desktop">
                <NuxtLink :to="social.telegram" class="consultation-btn">
                  Бесплатная консультация
                  <img src="/assets/icons/telegram.svg" alt="Telegram" class="consultation-btn__icon">
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Description -->
      <div v-if="product.fullDescription" class="product-description">
        <h2 class="product-description__title font-h3">Описание</h2>
        <div class="product-description__content font-text_medium" v-html="product.fullDescription"></div>
      </div>

      <!-- Similar Products -->
      <div v-if="similarProducts.length > 0" class="similar-products">
        <h2 class="similar-products__title font-h3">Похожие товары</h2>
        <div class="products-grid">
          <ProductCard v-for="similarProduct in similarProducts" :key="similarProduct.id" :product="similarProduct" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNavigationStore } from '@/stores/navigation'
import { useProductsStore } from '@/stores/products'

const route = useRoute()
const navigationStore = useNavigationStore()
const productsStore = useProductsStore()
const social = computed(() => navigationStore.socialLinks)

// State
const activeThumb = ref(0)
const productId = computed(() => parseInt(route.params.id) || 0)

// Get product data from store
const productData = computed(() => {
  return productsStore.getProductById(productId.value) || null
})

// If product not found, redirect to 404
if (process.client && !productData.value) {
  navigateTo('/404')
}

// Create reactive product object with default values
const product = computed(() => {
  if (!productData.value) return {}
  
  return {
    ...productData.value,
    // Ensure gallery is always an array with at least the main image
    gallery: productData.value.gallery && productData.value.gallery.length > 0 
      ? productData.value.gallery 
      : [productData.value.image],
    // Default specifications if not provided
    specifications: productData.value.specifications || {
      'Тип товара': 'Товар',
      'Бренд': productData.value.brand || 'Не указан',
      'Артикул': productData.value.article || 'Не указан',
    },
    // Default description if not provided
    fullDescription: productData.value.fullDescription || `<p>${productData.value.description || 'Описание отсутствует'}</p>`
  }
})

// Current displayed image based on active thumb
const currentImage = computed(() => {
  if (!product.value.gallery || product.value.gallery.length === 0) {
    return product.value.image
  }
  return product.value.gallery[activeThumb.value] || product.value.gallery[0]
})

// Get category information
const categoryName = computed(() => product.value.category || 'Категория')
const category = computed(() => navigationStore.getCategoryByName(categoryName.value))
const categoryUrl = computed(() => category.value?.url || '/')

// Get similar products from the same category
const similarProducts = computed(() => {
  if (!product.value || !product.value.category) return []
  
  return productsStore.getProductsByCategory(product.value.category)
    .filter(p => p.id !== productId.value) // Exclude current product
    .slice(0, 4) // Limit to 4 similar products
})

// Methods
const setActiveThumb = (index) => {
  if (index >= 0 && index < product.value.gallery.length) {
    activeThumb.value = index
  }
}

const handleThumbError = (index) => {
  console.warn(`Ошибка загрузки миниатюры ${index}:`, product.value.gallery[index])
  // Можно заменить на placeholder или удалить из галереи
}

const handleBrandError = (event) => {
  console.warn('Ошибка загрузки логотипа бренда:', event.target.src)
  event.target.style.display = 'none'
}

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price)
}

// Reset active thumb when product changes
watch(() => productId.value, () => {
  activeThumb.value = 0
})

// Page title and meta
useHead(() => ({
  title: `${product.value.title || 'Товар'} - КОВРИК`,
  meta: [
    { 
      name: 'description', 
      content: `${product.value.title || 'Товар'} - ${product.value.description || 'купить в магазине КОВРИК'}` 
    },
    { 
      name: 'keywords', 
      content: `${product.value.title}, ${product.value.category}, ${product.value.brand || ''}, КОВРИК Урай`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '') 
    },
    { property: 'og:title', content: `${product.value.title || 'Товар'} - КОВРИК` },
    { property: 'og:description', content: product.value.description || 'Товар в магазине КОВРИК' },
    { property: 'og:image', content: currentImage.value },
    { property: 'og:type', content: 'product' }
  ]
}))
</script>

<style lang="sass">
@import '@color'
@import '@mixin'
@import '@global'

.product-page
  padding-bottom: 60px

.breadcrumbs
  display: flex
  align-items: center
  flex-wrap: wrap
  margin-bottom: 20px

.breadcrumbs__link
  color: $text-secondary
  text-decoration: none
  font-size: 14px
  transition: color 0.3s ease
  
  &:hover
    color: $primary

.breadcrumbs__separator
  margin: 0 10px
  color: $text-secondary
  font-size: 14px

.breadcrumbs__current
  color: $text-primary
  font-size: 14px
  font-weight: 500

.product-info
  background-color: $white
  border-radius: $radius
  margin-bottom: 40px

.product-layout
  display: grid
  grid-template-columns: 1.5fr 1fr
  gap: 30px
  
  @include tablet
    grid-template-columns: 1fr
    
  @include mobile
    grid-template-columns: 1fr

.product-layout__main
  grid-column: 1
  display: flex
  flex-direction: column
  gap: 20px
  
  @include tablet
    grid-column: 1
    grid-row: 1
  
  @include mobile
    grid-column: 1
    grid-row: 1

.product-layout__specs
  grid-column: 2
  
  @include tablet
    grid-column: 1
    grid-row: 2
  
  @include mobile
    grid-column: 1
    grid-row: 2

.product-gallery
  position: relative

.product-gallery__main
  width: 100%
  height: 600px
  border-radius: $radius
  overflow: hidden
  margin-bottom: 15px
  background-color: #f5f5f5
  display: flex
  align-items: center
  justify-content: center

.product-gallery__image
  width: 100%
  height: 100%
  object-fit: cover
  transition: opacity 0.3s ease

.product-gallery__thumbs
  display: flex
  gap: 10px
  flex-wrap: wrap

.product-gallery__thumb
  width: 80px
  height: 80px
  border-radius: $radius
  overflow: hidden
  cursor: pointer
  border: 2px solid transparent
  transition: all 0.3s ease
  background-color: #f5f5f5
  
  img
    width: 100%
    height: 100%
    object-fit: cover
  
  &--active
    border-color: $primary
    
  &:hover
    border-color: lighten($primary, 20%)

.product-details
  height: 100%
  display: flex
  flex-direction: column

.product-details__title
  margin: 0 0 20px
  color: $text-primary

.product-details__meta
  margin-bottom: 20px

.product-details__meta-item
  display: flex
  align-items: center
  margin-bottom: 10px
  
  &:last-child
    margin-bottom: 0

.product-details__meta-label
  width: 120px
  font-weight: 500
  color: $text-secondary
  flex-shrink: 0

.product-details__meta-value
  color: $text-primary
  
  &[src] // для изображений
    max-width: 80px
    max-height: 40px
    object-fit: contain

.product-details__price-block
  display: flex
  align-items: center
  margin-top: auto

.product-details__price
  font-size: 32px
  font-weight: 700
  color: $text-primary
  margin: 0

.product-specs
  display: flex
  flex-direction: column
  border-radius: $radius
  height: 100%
  background-color: $white

.product-specs__title
  padding: 15px
  font-size: 28px
  font-weight: 600
  margin: 0
  color: $text-primary
  border-bottom: 1px solid $border-light

.product-specs__list
  padding: 0
  margin-bottom: 20px
  flex-grow: 1

.product-specs__row
  display: flex
  border-bottom: 1px solid $border-light
  
  &:last-child
    border-bottom: none

.product-specs__name
  width: 40%
  padding: 10px 15px
  background-color: $bg-light
  font-size: 14px
  color: $text-secondary

.product-specs__value
  width: 60%
  padding: 10px 15px
  font-size: 16px
  color: $text-primary

.product-specs__actions
  margin-top: auto
  display: flex
  justify-content: center
  padding: 15px

  &--mobile
    display: none

.consultation-btn
  display: flex
  align-items: center
  justify-content: space-between
  width: 100%
  padding: 15px 20px
  background-color: #4DA7DE
  color: $white
  border: none
  border-radius: 50px
  font-size: 16px
  font-weight: 700
  cursor: pointer
  transition: all 0.3s ease
  text-decoration: none
  
  &:hover
    background-color: darken(#4DA7DE, 5%)
    color: $white

.consultation-btn__icon
  width: 34px
  height: 34px
  margin-left: 10px

.product-description
  background-color: $white
  border-radius: $radius

.product-description__title
  margin: 0 0 20px
  color: $text-primary

.product-description__content
  color: $text-primary
  
  p
    margin-bottom: 15px
    line-height: 1.6
    
    &:last-child
      margin-bottom: 0

.similar-products
  margin-top: 40px

.similar-products__title
  margin: 0 0 20px
  color: $text-primary

.products-grid
  display: grid
  grid-template-columns: repeat(4, 1fr)
  gap: 20px
  
  @include tablet
    grid-template-columns: repeat(2, 1fr)
  
  @include mobile
    grid-template-columns: 1fr

@include tablet
  .product-specs__actions
    &--mobile
      display: flex
      padding: 0 0 15px 0
      
    &--desktop
      display: none

  .product-gallery__main
    height: 350px
  
  .product-details__price
    font-size: 28px

@include mobile
  .product-gallery__main
    height: 300px
  
  .product-gallery__thumb
    width: 60px
    height: 60px
  
  .product-details__title
    font-size: 20px
    margin-bottom: 15px
  
  .product-details__meta-label
    width: 100px
    font-size: 14px
  
  .product-details__price
    font-size: 24px
  
  .product-specs__title
    font-size: 24px
    
  .consultation-btn
    font-size: 14px
    padding: 12px 16px
    
  .consultation-btn__icon
    width: 28px
    height: 28px
</style>