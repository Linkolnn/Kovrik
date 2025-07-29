<template>
  <div class="slider">
    <Swiper
      :modules="[SwiperNavigation, SwiperPagination, SwiperAutoplay]"
      :slides-per-view="1"
      :loop="true"
      :autoplay="{
        delay: 5000,
        disableOnInteraction: false
      }"
      :pagination="{
        clickable: true
      }"
      :navigation="{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }"
      class="slider__swiper"
    >
      <SwiperSlide v-for="(slide, index) in slides" :key="index" class="slider__slide">
        <div class="slider__image-wrapper">
          <img :src="slide.image" :alt="slide.title" class="slider__image">
        </div>
        <div class="slider__content">
          <h2 class="slider__title font-h2">{{ slide.title }}</h2>
          <p class="slider__description font-text_medium">{{ slide.description }}</p>
        </div>
      </SwiperSlide>
      <div class="swiper-button-prev">
        <img src="/assets/icons/Arrow.svg" alt="Предыдущий" class="slider__arrow slider__arrow--prev">
      </div>
      <div class="swiper-button-next">
        <img src="/assets/icons/Arrow.svg" alt="Следующий" class="slider__arrow slider__arrow--next">
      </div>
    </Swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation, Pagination as SwiperPagination, Autoplay as SwiperAutoplay } from 'swiper/modules';

const props = defineProps({
  slides: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style lang="sass">
@import '@color'
@import '@mixin'
@import '@global'

.slider
  width: 100%
  position: relative
  margin-bottom: 20px
  overflow: hidden

  .swiper-pagination
    bottom: 20px

.slider__swiper
  width: 100%
  height: 727px
  
  @include mobile
    height: 354px

.slider__slide
  position: relative
  height: 100%
  width: 100%

.slider__image-wrapper
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  z-index: 1

.slider__image
  width: 100%
  height: 100%
  object-fit: cover

.slider__content
  position: relative
  z-index: 2
  height: 100%
  display: flex
  flex-direction: column
  justify-content: flex-end
  padding: 0 20px 60px
  color: $white
  background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)
  
  @include mobile
    padding: 0 30px 40px

.slider__title
  margin-bottom: 20px
  max-width: 60%

.slider__description
  margin-bottom: 0
  max-width: 500px

.swiper-button-prev,
.swiper-button-next
  position: absolute
  top: 50%
  transform: translateY(-50%)
  width: 60px
  height: 60px
  border-radius: 12px
  background-color: #3A3A3A
  z-index: 10
  display: flex
  align-items: center
  justify-content: center
  cursor: pointer
  transition: all 0.3s ease
  
  &:hover
    background-color: #2A2A2A
  
  &::after
    display: none
    
  @include tablet
    width: 50px
    height: 50px
    
  @include mobile
    width: 40px
    height: 40px

.swiper-button-prev
  left: 20px
  
.swiper-button-next
  right: 20px

.slider__arrow
  width: 24px
  height: 24px

  &--next
    transform: rotate(180deg)

.swiper-pagination-bullet
  width: 10px
  height: 10px
  background-color: $white
  cursor: pointer


@include tablet
  .slider
    .swiper-pagination
      bottom: 5px

  .slider__swiper
    height: 500px
  
  .slider__content
    padding: 0 40px 40px
  
  .slider__title
    max-width: 100%
    margin-bottom: 15px
    font-size: 28px

@include mobile
  .slider__content
    padding: 0 20px 30px
  
  .slider__title
    margin-bottom: 10px
    font-size: 24px
  
  .swiper-button-prev,
  .swiper-button-next
    display: none
</style>
