<script setup>
import { useNavigationStore } from '../stores/navigation';
import { showMenu, hideMenu } from '../animation/animation';

const navigationStore = useNavigationStore();
const contacts = computed(() => navigationStore.contactInfo);

const toggleNavMenu = () => {
  const navMenu = document.querySelector('.nav__menu');
  if (navMenu) {
    navigationStore.toggleMenu();
    if (navigationStore.isMenuOpen) {
      showMenu(navMenu);
      document.body.style.overflow = 'hidden';
    } else {
      hideMenu(navMenu);
      document.body.style.overflow = 'auto';
    }
  }
};
</script>

<template>
    <header class="header">
        <div class="header__top">
            <div class="header__container">
                <div class="header__content">
                    <div class="header__contacts header__contacts--left">
                        <NuxtLink class="header__link" :to="`tel:${contacts.phone}`">
                            <p class="header__contact">
                                {{ contacts.phone }}
                            </p>
                        </NuxtLink> 
                        <NuxtLink class="header__link" :to="`mailto:${contacts.email}`">
                            <p class="header__contact">
                                {{ contacts.email }}
                            </p>
                        </NuxtLink>
                    </div>
                    <div class="header__logo-wrapper">
                        <NuxtLink class="header__logo-link" to="/">
                            <img src="/assets/icons/Logo.svg" alt="Визит" class="header__logo-icon" />
                        </NuxtLink>
                    </div>
                    <div class="header__contacts header__contacts--right">
                        <p class="header__address">
                            {{ contacts.address }}
                        </p>
                    </div>
                    <button @click="toggleNavMenu" class="header_burger-btn header_burger-btn--mobile" :class="{ 'is-active': navigationStore.isMenuOpen }">
                        <div class="burger-icon">
                            <span class="burger-icon__line"></span>
                            <span class="burger-icon__line"></span>
                            <span class="burger-icon__line"></span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
        <div class="header__nav">
            <div class="header__container">
                <NavMenu />
            </div>
        </div>
    </header>
</template>
<style lang="sass">
@import '@color'
@import '@mixin'
@import '@global'

.header
  width: 100%

.header__container
  max-width: 1400px
  margin: 0 auto
  padding: 0 15px

.header__logo-icon
  width: 428px
  height: 130px

.header__top
  background-color: $white
  padding: 15px 0

.header__content
  display: flex
  justify-content: space-between
  padding: 15px 0

.header__logo-wrapper
  display: flex
  justify-content: center
  align-items: center
  position: relative

.header__logo-link
  text-decoration: none
  display: flex
  align-items: center

.header__logo-wrapper
  text-align: center

.header__contacts
  display: flex
  flex-direction: column
  font-size: 20px
  font-weight: 800
  >*
  font-size: 20px
  font-weight: 800
  
  &--left
    align-items: flex-start
  
  &--right
    align-items: flex-end

.header__link
  text-decoration: none
  color: $black

.header__address
  text-align: right

.header_burger-btn
  display: none
  background: none
  border: none
  cursor: pointer
  padding: 10px
  
  &--mobile
    position: absolute
    right: 0px
    top: 50%
    transform: translateY(-50%)
    z-index: 1001

.burger-icon
  width: 30px
  height: 20px
  position: relative
  transition: transform 0.3s ease
  
  &__line
    display: block
    position: absolute
    height: 3px
    width: 100%
    background-color: $black
    border-radius: 3px
    left: 0
    transform: rotate(0deg)
    transition: all 0.25s ease-in-out
    
    &:nth-child(1)
      top: 0
    
    &:nth-child(2)
      top: 50%
      transform: translateY(-50%)
    
    &:nth-child(3)
      bottom: 0

  .is-active &
    &__line
      &:nth-child(1)
        top: 50%
        transform: translateY(-50%) rotate(45deg)
      
      &:nth-child(2)
        opacity: 0
      
      &:nth-child(3)
        bottom: 50%
        transform: translateY(50%) rotate(-45deg)

@include mobile
  .header__top
    position: relative
    
  .header__content
    flex-direction: row
    justify-content: center
    align-items: center
    padding: 10px 0
    position: relative
    
  .header_burger-btn
    &--mobile
      display: block
      
  .header__logo-icon
    width: 200px
    height: auto
  
  .header__contacts
    display: none
    &--left, &--right
      align-items: center
      text-align: center
  
  .header__address
    text-align: center
    
  .header__title
    font-size: 24px
    
  .header__subtitle
    font-size: 11px
</style>