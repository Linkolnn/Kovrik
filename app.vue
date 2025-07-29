<template>
  <div class="app">
    <Header />
    <main class="main">
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script setup>
</script>

<style lang="sass">
@import '@color'
@import '@mixin'
@import '@global'

.app
  display: flex
  flex-direction: column
  min-height: 100vh

.main
  flex: 1
  padding-top: 20px
  @include mobile
    padding-top: 0

</style>
