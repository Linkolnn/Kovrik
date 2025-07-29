<script setup>
import { showMenu, hideMenu } from '../animation/animation';
import { useNavigationStore } from '../stores/navigation';

const navigationStore = useNavigationStore();
const navMenuItems = computed(() => navigationStore.categoryList);
const contacts = computed(() => navigationStore.contactInfo);
const social = computed(() => navigationStore.socialLinks);
const navMenu = ref(null);
const isMobile = ref(false);

const closeNavMenu = () => {
  if (!navMenu.value) return;
  navigationStore.closeMenu();
  hideMenu(navMenu.value);
  document.body.style.overflow = 'auto';
};

const handleNavClick = () => {
  if (process.client && isMobile.value) {
    closeNavMenu();
  }
};

const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 859;
};

onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});
</script>
<template>
  <nav ref="navMenu" class="nav__menu">
    <ul class="nav__list">
        <li v-for="item in navMenuItems" :key="item.id" class="nav__list-item">
            <NuxtLink @click="handleNavClick" 
                class="nav__list-link" 
                :to="item.url"
                :style="{ backgroundColor: item.color }"
            >
                {{ item.name }}
            </NuxtLink>
        </li>
    </ul>
    <div class="nav__contacts-mobile">
        <div class="nav__logo-mobile">
            <img src="/assets/icons/Logo-white.svg" alt="Визит" class="nav__logo-mobile-icon">
        </div>
        <NuxtLink class="nav__contact-mobile" :to="`tel:${contacts.phone}`">{{ contacts.phone }}</NuxtLink>
        <p class="nav__contact-mobile">{{ contacts.address }}</p>
        <NuxtLink class="nav__contact-mobile" :to="`mailto:${contacts.email}`">{{ contacts.email }}</NuxtLink>
        <div class="nav__social">
            <NuxtLink :to="social.telegram" target="_blank" class="nav__social-link">
                <img src="/assets/icons/telegram.svg" alt="Telegram" class="nav__social-icon">
            </NuxtLink>
            <NuxtLink :to="social.vk" target="_blank" class="nav__social-link">
                <img src="/assets/icons/vk.svg" alt="VK" class="nav__social-icon">
            </NuxtLink>
        </div>
    </div>
  </nav>
</template>
<style lang="sass">
@import '@color'
@import '@mixin'
@import '@global'

.nav__list
  display: flex
  width: 100%
  margin: 0
  padding: 0

.nav__list-item
  flex: 1
  list-style: none

.nav__list-link
  display: block
  text-decoration: none
  text-align: center
  white-space: nowrap
  color: $white
  background-color: transparent
  width: 100%
  font-size: 20px
  padding: 20px 10px
  cursor: pointer
  font-weight: 800
  @include transition
  
  &--active
    color: $white

.nav__menu-content
  width: 100%

.nav__logo-mobile
  display: none

.nav__contacts-mobile
  display: none

.nav__social
  display: flex
  gap: 20px
  margin-top: 20px
  justify-content: center

.nav__social-link
  text-decoration: none
  color: $black

.nav__social-icon
  width: 30px
  height: 30px

.nav__contact-mobile
  margin: 5px 0
  text-decoration: none
  color: $black
  font-size: 16px
  display: block

@include hover 
  .nav__list-link:hover
    opacity: 0.9

@include mobile
  .nav__menu
    display: none
    background: $bg-dark
    transform: translateX(-100%)
    position: fixed
    top: 100px
    left: 0
    bottom: 0
    width: 100%
    z-index: 1000
    overflow-y: auto
    display: flex
    flex-direction: column
    padding: 0
    will-change: transform

  .nav__logo-mobile
    display: block
    margin-bottom: 10px
    text-align: center

  .nav__logo-mobile-icon
    width: 187px
    height: 57px

  .nav__logo-text
    font-size: 32px
    margin: 0
    font-weight: bold
    color: $black

  .nav__logo-subtitle
    font-size: 14px
    margin: 0
    color: $black

  .nav_burger-btn
    display: block
    z-index: 1001
    &--close
      position: absolute
      top: 20px
      right: 20px

  .nav_burger-icon
    font-size: 28px

  .nav__list
    flex-direction: column

  .nav__contacts-mobile
    display: flex
    flex-direction: column
    align-items: center
    margin-top: 30px
    
  .nav__list-link
    text-align: center
    padding: 0
    height: 95px
    line-height: 75px
    display: flex
    align-items: center
    justify-content: center
    &--active
      color: $white

  .nav__contacts-mobile
    display: block

  .nav__contact-mobile
    margin: 10px 0
    font-size: 16px
    color: $white
    text-align: center

  .nav__social
    display: flex
    margin-top: 20px
    justify-content: center

  .nav__social-icon
    width: 45px
    height: 45px
</style>