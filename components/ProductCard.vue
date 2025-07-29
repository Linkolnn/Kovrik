<template>
  <article 
    class="product-card" 
    @click="navigateTo(`/product/${product.id}`)" 
    :style="{ backgroundColor: categoryColor }"
  >
    <div class="product-card__image-wrapper" ref="imageWrapper">
      <!-- Placeholder пока изображение не загружено -->
      <div v-if="!imageLoaded && !imageError" class="product-card__placeholder">
        <div class="product-card__wave-animation"></div>
      </div>
      
      <!-- Основное изображение товара -->
      <img 
        v-show="imageLoaded && !imageError"
        ref="productImage"
        :src="imageSrc" 
        :alt="product.title" 
        class="product-card__image"
        @load="handleImageLoad"
      >
      
      <!-- Fallback изображение при ошибке -->
      <div v-if="imageError" class="product-card__image-error">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#ccc"/>
          <path d="M13.96 12.17L11.06 14.4L9.45 12.48L6.5 16.5H17.5L13.96 12.17Z" fill="#ccc"/>
        </svg>
        <p>Изображение недоступно</p>
      </div>
      
      <!-- Логотип бренда -->
      <div 
        v-if="product.brand" 
        :style="{ background: categoryColor }" 
        class="product-card__brand"
      >
        <img 
          :src="product.brand" 
          :alt="product.title" 
          class="product-card__brand-logo"
          @load="brandLoaded = true"
          @error="brandLoaded = false"
        >
      </div>
    </div>
    
    <div class="product-card__content">
      <h3 class="product-card__title">{{ product.title }}</h3>
      <p class="product-card__description">{{ product.description }}</p>
      <div class="product-card__footer">
        <div v-if="product.price" class="product-card__price-block">
          <p class="product-card__price">
            {{ formatPrice(product.price) }} ₽
          </p>
        </div>
        <NuxtLink 
          class="product-card__btn" 
          :class="{'no-price': !product.price}" 
          :to="`/product/${product.id}`" 
          :style="{ color: categoryColor }"
        >
          Подробнее
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup>
import { useNavigationStore } from '@/stores/navigation'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  categoryName: {
    type: String,
    default: null
  }
})

const navigationStore = useNavigationStore()

// Reactive refs для ленивой загрузки
const imageWrapper = ref(null)
const productImage = ref(null)  
const imageSrc = ref('')
const imageLoaded = ref(false)
const imageError = ref(false)
const brandLoaded = ref(false)
const isIntersecting = ref(false)

// Intersection Observer
let observer = null

const categoryColor = computed(() => {
  const categoryName = props.product.category || props.categoryName
  if (categoryName) {
    const category = navigationStore.getCategoryByName(categoryName)
    return category ? category.color : '#5e7a8a'
  }
  return '#5e7a8a'
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price)
}

// Обработчики загрузки изображений
const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

// Функция начала загрузки изображения
const startImageLoading = () => {
  if (props.product.image && !imageSrc.value) {
    imageSrc.value = props.product.image
  }
}

// Настройка Intersection Observer
const setupIntersectionObserver = () => {
  if (!imageWrapper.value) return
  
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  }
  
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isIntersecting.value) {
        isIntersecting.value = true
        startImageLoading()
        
        if (observer) {
          observer.unobserve(entry.target)
        }
      }
    })
  }, options)
  
  observer.observe(imageWrapper.value)
}

// Очистка observer
const cleanupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

// Lifecycle hooks
onMounted(() => {
  if (props.product.image) {
    setupIntersectionObserver()
  } else {
    imageError.value = true
  }
})

onUnmounted(() => {
  cleanupObserver()
})
</script>

<style lang="sass">
@import '@color'
@import '@mixin'
@import '@global'

.product-card
  display: flex
  flex-direction: column
  border-radius: $radius
  overflow: hidden
  transition: all 0.3s ease
  color: $white
  height: 100%
  position: relative
  padding: 15px

.product-card__image-wrapper
  position: relative
  width: 100%
  height: 242px
  background-color: $white
  border-radius: $radius
  overflow: hidden
  margin-bottom: 10px
  display: flex
  justify-content: center
  align-items: center

.product-card__image
  width: 100%
  height: 100%
  object-fit: cover
  border-radius: $radius
  transition: opacity 0.3s ease

.product-card__placeholder
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: #f5f5f5
  display: flex
  justify-content: center
  align-items: center
  border-radius: $radius
  overflow: hidden

.product-card__wave-animation
  width: 100%
  height: 100%
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.1) 100%
  )
  background-size: 200% 100%
  animation: wave 1.5s ease-in-out infinite

.product-card__image-error
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: #f9f9f9
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  border-radius: $radius
  
  p
    margin: 8px 0 0 0
    font-size: 12px
    color: #999
    text-align: center

.product-card__brand
  position: absolute
  bottom: -3px
  right: -2px
  max-width: 105px
  min-width: 65px
  height: 30px
  border-radius: 15px 0 15px 0
  padding: 3px
  overflow: hidden
  display: flex
  justify-content: center
  align-items: center

.product-card__brand-logo
  width: 100%
  height: 100%
  border-radius: 15px 0 15px 0
  padding: 1px
  background: #fff
  object-fit: contain

.product-card__content
  padding: 0 5px
  display: flex
  flex-direction: column
  gap: 10px
  flex-grow: 1

.product-card__title
  font-size: 20px
  font-weight: 600
  color: $white
  line-height: 1.2
  flex-grow: 1
  display: -webkit-box
  -webkit-line-clamp: 3
  -webkit-box-orient: vertical
  overflow: hidden
  text-overflow: ellipsis

.product-card__description
  max-height: 65px
  font-size: 16px
  color: rgba(255, 255, 255, 0.8)
  flex-grow: 1
  line-height: 1.3
  display: -webkit-box
  -webkit-line-clamp: 3
  -webkit-box-orient: vertical
  overflow: hidden
  text-overflow: ellipsis

.product-card__footer
  display: flex
  justify-content: space-between
  align-items: center
  margin-top: auto

.product-card__price-block
  display: flex
  flex-direction: column
  align-items: flex-start

.product-card__price
  font-size: 34px
  font-weight: 700
  margin: 0
  color: $white
  line-height: 1.2

.product-card__btn
  display: inline-block
  padding: 8px 15px
  background-color: rgba(255, 255, 255, 0.9)
  color: $black
  border-radius: $radius
  text-decoration: none
  font-weight: 700
  font-size: 18px
  text-align: center
  transition: all 0.3s ease
  white-space: nowrap 

  &:hover
    background-color: $white

.no-price 
  width: 100%

@keyframes wave
  0%
    background-position: 200% 0
  100%
    background-position: 0 0

@include hover
  .product-card:hover
    transform: translateY(-3px)

@include mobile
  .product-card__image-wrapper
    height: 200px
    
  .product-card__title
    font-size: 18px
    
  .product-card__description
    font-size: 14px
    
  .product-card__price
    font-size: 28px
    
  .product-card__btn
    font-size: 16px
    padding: 6px 12px
</style>