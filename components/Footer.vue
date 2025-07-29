<template>
  <footer class="footer container">
    <div class="footer__top">
      <div class="footer__content">
        <div class="footer__contacts footer__contacts--left">
          <NuxtLink class="footer__link" :to="`tel:${contacts.phone}`">
            <p class="footer__contact">
              {{ contacts.phone }}
            </p>
          </NuxtLink> 
          <NuxtLink class="footer__link" :to="`mailto:${contacts.email}`">
            <p class="footer__contact">
              {{ contacts.email }}
            </p>
          </NuxtLink>
        </div>
        
        <!-- Teleport для мобильных контактов -->
        <client-only>
          <Teleport to="#mobile-contacts-container" v-if="isMobile">
            <div class="footer__mobile-contacts">
              <NuxtLink class="footer__link" :to="`tel:${contacts.phone}`">
                <p class="footer__contact">
                  {{ contacts.phone }}
                </p>
              </NuxtLink> 
              <NuxtLink class="footer__link" :to="`mailto:${contacts.email}`">
                <p class="footer__contact">
                  {{ contacts.email }}
                </p>
              </NuxtLink>
              <p class="footer__address footer__address--mobile">
                {{ contacts.address }}
              </p>
            </div>
          </Teleport>
        </client-only>
        <div class="footer__logo-wrapper">
          <NuxtLink class="footer__logo-link" to="/">
            <img src="/assets/icons/Logo-white.svg" alt="Визит" class="footer__logo-icon" />
          </NuxtLink>
          <!-- Контейнер для мобильных контактов -->
          <div id="mobile-contacts-container" class="footer__mobile-contacts-container"></div>
        </div>
        <div class="footer__contacts footer__contacts--right">
          <p class="footer__address">
            {{ contacts.address }}
          </p>
        </div>
      </div>
    </div>
    <div class="footer__social-bar">
      <div class="footer__social">
        <NuxtLink :to="social.telegram" target="_blank" class="footer__social-link">
          <img src="/assets/icons/telegram.svg" alt="Telegram" class="footer__social-icon">
        </NuxtLink>
        <NuxtLink :to="social.vk" target="_blank" class="footer__social-link">
          <img src="/assets/icons/vk.svg" alt="VK" class="footer__social-icon">
        </NuxtLink>
      </div>
    </div>
    <div class="footer__nav">
      <div class="footer__container">
        <NavMenu />
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useNavigationStore } from '../stores/navigation';

const navigationStore = useNavigationStore();
const navMenuItems = computed(() => navigationStore.categoryList);
const contacts = computed(() => navigationStore.contactInfo);
const social = computed(() => navigationStore.socialLinks);

// Определение мобильной версии
const isMobile = ref(false);

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

<style lang="sass">
@import '@color'
@import '@mixin'
@import '@global'

.footer
  background-color: $bg-dark
  width: 100%
  color: $text-light

.footer__top
  background-color: $bg-dark
  padding: 15px 0

.footer__content
  display: flex
  justify-content: space-between
  padding: 15px 0

.footer__logo-wrapper
  display: flex
  flex-direction: column
  align-items: center
  text-align: center

.footer__logo-link
  text-decoration: none
  display: flex
  align-items: center

.footer__logo-icon
  width: 376px
  height: 85px

.footer__contacts
  display: flex
  flex-direction: column
  font-size: 20px
  font-weight: 800
  
  &--left
    align-items: flex-start
  
  &--right
    align-items: flex-end

.footer__link
  text-decoration: none
  color: $text-light

.footer__social-bar
  background-color: $bg-dark
  padding-bottom: 15px 

.footer__social
  display: flex
  gap: 20px

.footer__social-link
  display: flex
  align-items: center
  justify-content: center

.footer__social-icon
  width: 45px
  height: 45px

.footer__nav
  background-color: $bg-dark
  padding: 0
  transition: all 0.3s ease

.footer__mobile-contacts-container
  display: none

.footer__mobile-contacts
  display: flex
  flex-direction: column
  align-items: center
  text-align: center
  margin-top: 15px

.footer__address--mobile
  text-align: center
  margin-top: 10px

@include mobile
  .footer__content
    flex-direction: column
    align-items: center
    gap: 15px
    
  .footer__logo-icon
    width: 200px
    height: auto
    
  .footer__contacts
    display: none
    
    &--mobile
      display: flex
      flex-direction: column
      align-items: center
      text-align: center
      
  .footer__mobile-contacts-container
    display: block
    
  .footer__address
    text-align: center

.footer__nav-list
  display: flex
  padding: 15px 0
  margin: 0
  justify-content: space-between

.footer__nav-item
  flex: 1

.footer__nav-link
  display: block
  text-align: center
  padding: 10px
  color: $text-light
  text-decoration: none
  font-weight: 500
  transition: all 0.3s ease

@include hover
  .footer__nav-link:hover
    opacity: 0.9

@include mobile
  .footer__top
    flex-direction: column
    align-items: center
    text-align: center
    gap: 20px
  
  .footer__contacts
    align-items: center

  .footer__social
    justify-content: center

  .footer__nav-list
    flex-direction: column
  
  .footer__nav-item
    margin-bottom: 5px
  
  .footer__nav-link
    padding: 12px
</style>
