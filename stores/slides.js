import { defineStore } from 'pinia';
import slidesData from '@/data/slides.json';

export const useSlidesStore = defineStore('slides', {
  state: () => ({
    slidesList: slidesData.slides
  }),
  getters: {
    getSlides: (state) => state.slidesList
  }
});
