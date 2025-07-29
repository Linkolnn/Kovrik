<template>
  <div class="map">
    <div class="map__container" ref="mapContainer"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

// Координаты магазина ВИЗИТ
const storeCoordinates = [60.116734, 64.774780];
// Координаты магазина Коврик
const kovrikCoordinates = [60.127297, 64.788508];
// Центр карты - между двумя магазинами
const centerCoords = [(storeCoordinates[0] + kovrikCoordinates[0]) / 2, (storeCoordinates[1] + kovrikCoordinates[1]) / 2];

// Информация о магазине ВИЗИТ
const storeName = 'ВИЗИТ';
const storeAddress = 'г. Урай мкр 1Д, дом 75А';
const storePhone = '+734676 20022';

// Информация о магазине Коврик
const kovrikName = 'Коврик';
const kovrikAddress = 'г. Урай, мкр 2, д. 91';
const kovrikPhone = '+734676 33022';

const mapContainer = ref(null);
let map = null;

const config = useRuntimeConfig();
const apiKey = config.public.apiKey;

onMounted(() => {
  // Загрузка API Яндекс Карт
  if (typeof window !== 'undefined' && !window.ymaps) {
    const yandexMapScript = document.createElement('script');
    yandexMapScript.setAttribute('src', `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`);
    yandexMapScript.addEventListener('load', initYandexMap);
    document.head.appendChild(yandexMapScript);
  } else if (window.ymaps) {
    // Если API уже загружен, просто инициализируем карту
    initYandexMap();
  }
});

// Инициализация карты
function initYandexMap() {
  ymaps.ready(() => {
    map = new ymaps.Map(mapContainer.value, {
      center: centerCoords,
      zoom: 14, // Уменьшаем масштаб, чтобы видеть оба магазина
      controls: ['zoomControl', 'fullscreenControl']
    });
    
    // Функция для создания кастомного макета плейсмарка
    function createCustomLayout(logoPath, altText) {
      return window.ymaps.templateLayoutFactory.createClass(
        '<div class="custom-placemark">' +
        '<div class="custom-placemark__inner">' +
        `<img src="${logoPath}" alt="${altText}" class="custom-placemark__image">` +
        '</div>' +
        '</div>',
        {
          build: function() {
            this.constructor.superclass.build.call(this);
            // Добавляем стили для кастомного плейсмарка
            const element = this.getElement();
            element.style.position = 'relative';
            element.style.width = '60px';
            element.style.height = '60px';
            element.style.marginLeft = '-30px';
            element.style.marginTop = '-30px';
            element.style.cursor = 'pointer';
            
            const inner = element.querySelector('.custom-placemark__inner');
            inner.style.width = '54px';
            inner.style.height = '54px';
            inner.style.borderRadius = '50%';
            inner.style.border = '3px solid #ffffff';
            inner.style.overflow = 'hidden';
            inner.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.3)';
            inner.style.backgroundColor = '#ffffff';
            
            const image = element.querySelector('.custom-placemark__image');
            image.style.width = '100%';
            image.style.height = '100%';
            image.style.objectFit = 'contain';
            image.style.padding = '0px';
          }
        }
      );
    }
    
    // Функция для создания баллуна с информацией о магазине
    function createBalloonContent(name, address, phone) {
      return `
        <div class="map-balloon">
          <h3>${name}</h3>
          <p><strong>Адрес:</strong> ${address}</p>
          <p><strong>Телефон:</strong> ${phone}</p>
        </div>
      `;
    }

    // Создание кастомного плейсмарка для ВИЗИТ
    const vizitLayout = createCustomLayout('/assets/icons/Logo.svg', storeName);
    const vizitPlacemark = new ymaps.Placemark(storeCoordinates, {
      hintContent: storeName,
      balloonContent: createBalloonContent(storeName, storeAddress, storePhone)
    }, {
      iconLayout: vizitLayout,
      iconOffset: [-25, -25]
    });
    
    // Создание кастомного плейсмарка для Коврик
    const kovrikLayout = createCustomLayout('/assets/icons/Logo-kovr.svg', kovrikName);
    const kovrikPlacemark = new ymaps.Placemark(kovrikCoordinates, {
      hintContent: kovrikName,
      balloonContent: createBalloonContent(kovrikName, kovrikAddress, kovrikPhone)
    }, {
      iconLayout: kovrikLayout,
      iconOffset: [-25, -25]
    });
    
    // Добавляем оба плейсмарка на карту
    map.geoObjects.add(vizitPlacemark);
    map.geoObjects.add(kovrikPlacemark);
    
    // Отключаем скролл карты колесом мыши
    map.behaviors.disable('scrollZoom');
    
    // Отключаем все кнопки управления, кроме масштабирования и полноэкранного режима
  });
}
</script>

<style lang="sass">
@import '@color'
@import '@mixin'
@import '@global'

.map
  width: 100%
  position: relative
  overflow: hidden

.map__container
  width: 100%
  height: 685px
  
  @include mobile
    height: 588px

.map-balloon
  padding: 10px
  max-width: 200px

  h3
    margin: 0 0 10px
    font-size: 16px
    font-weight: 600

  p
    margin: 5px 0
    font-size: 14px
    


@include tablet
  .map__container
    height: 450px

</style>
