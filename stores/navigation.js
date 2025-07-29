import { defineStore } from 'pinia';
import navigationData from '@/data/navigation.json';

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    categoryList: navigationData.categories,
    contactInfo: navigationData.contacts,
    socialLinks: navigationData.social,
    isMenuOpen: false
  }),
  getters: {
    getCategoryByUrl: (state) => (url) => {
      return state.categoryList.find(category => category.url === url);
    },
    getCategoryById: (state) => (id) => {
      return state.categoryList.find(category => category.id === id);
    },
    getCategoryByName: (state) => (name) => {
      return state.categoryList.find(category => category.name === name);
    }
  },
  actions: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    openMenu() {
      this.isMenuOpen = true;
    },
    closeMenu() {
      this.isMenuOpen = false;
    }
  }
});
