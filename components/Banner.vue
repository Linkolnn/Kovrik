<template>
  <div class="banner" :class="{ 'banner--video': isVideo}">
    <!-- Video Banner -->
    <div v-if="isVideo" class="banner__video-wrapper">
      <video 
        ref="videoRef"
        class="banner__video" 
        :src="mediaPath" 
        autoplay 
        muted 
        playsinline 
        loop
        @error="handleMediaError"
        @loadeddata="handleMediaLoad"
        @loadstart="handleMediaLoadStart"
        @canplay="handleMediaLoad"
      />
    </div>
    
    <!-- Image Banner -->
    <div v-else class="banner__image-wrapper">
      <img 
        ref="imageRef"
        class="banner__image" 
        :src="mediaPath" 
        :alt="altText"
        @error="handleMediaError"
        @load="handleMediaLoad"
        @loadstart="handleMediaLoadStart"
        @loadend="handleMediaLoad"
      />
    </div>    
    <!-- Content Overlay -->
    <div class="banner__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { useBannerStore } from '@/stores/banner'

const props = defineProps({
  categoryName: {
    type: String,
    required: true
  }
})

const bannerStore = useBannerStore()

// Reactive refs
const videoRef = ref(null)
const imageRef = ref(null)
const hasError = ref(false)

const mediaPath = computed(() => {
  return bannerStore.getCategoryMedia(props.categoryName)
})

const altText = computed(() => {
  return bannerStore.getCategoryAlt(props.categoryName)
})

const isVideo = computed(() => {
  return bannerStore.isVideoFile(mediaPath.value)
})

// Проверка доступности медиа при монтировании
const checkMediaAvailability = async () => {
  if (!mediaPath.value) return
  
  const exists = await bannerStore.checkMediaExists(mediaPath.value)
  if (!exists && props.categoryName !== 'default') {
    console.warn(`Медиа файл не найден: ${mediaPath.value}`)
  }
}

// Watchers
watch(() => props.categoryName, () => {
  hasError.value = false
  checkMediaAvailability()
}, { immediate: true })

watch(() => mediaPath.value, () => {
  hasError.value = false
}, { immediate: true })

onMounted(() => {
  checkMediaAvailability()
})

</script>

<style lang="sass">
@import '@color'
@import '@mixin'
@import '@global'

.banner
  position: relative
  width: 100%
  height: 727px
  overflow: hidden
  margin-bottom: 20px
  transition: all 0.3s ease
  
  @include mobile
    height: 354px

.banner__image-wrapper,
.banner__video-wrapper
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: #f5f5f5

.banner__image,
.banner__video
  width: 100%
  height: 100%
  object-fit: cover
  transition: opacity 0.3s ease

.banner__content
  position: relative
  z-index: 2
  height: 100%
  display: flex
  flex-direction: column
  justify-content: flex-end
  padding: 0 20px 60px
  color: $white
  background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)
  transition: opacity 0.3s ease
  
  @include mobile
    padding: 0 20px 30px

@include tablet
  .banner
    height: 500px
  
  .banner__content
    padding: 0 40px 40px

@include mobile
  .banner__content
    padding: 0 20px 30px
    
</style>