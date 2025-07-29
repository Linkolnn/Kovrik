import { defineStore } from 'pinia';
import productsData from '@/data/products.json';

export const useProductsStore = defineStore('products', {
  state: () => ({
    productList: productsData.products
  }),
  getters: {
    getProductsByCategory: (state) => (categoryName) => {
      return state.productList.filter(product => product.category === categoryName);
    },
    getProductById: (state) => (productId) => {
      return state.productList.find(product => product.id === productId);
    },
    getProductsByCollection: (state) => (collection) => {
      return state.productList.filter(product => product.collection === collection);
    },
    getProductsByBrand: (state) => (brand) => {
      return state.productList.filter(product => product.brand === brand);
    }
  }
});
