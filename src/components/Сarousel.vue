<script setup>
import {onMounted, ref} from "vue";
import {useCarousel} from "../composables/useCarousel.js";
import {TouchEvent} from "../utils/TouchEvent.js";
import {stadiums} from "../stadiums.js";
import {throttle} from "../utils/utils.js";
import Competitor from "./Competitor.vue";
const list = ref([]);
const isContentShow = ref(true);
const itemRefs = ref([]);
const isReady = ref(false);
const {setItem, getStyle, isActive, isSmall, setRefs, increment, decrement, activeIndex} = useCarousel({
  beforeIndexUpdate() {
    isContentShow.value = false;
    list.value.splice(0);
  }
})
const throttled = throttle(event => event.deltaY > 0 ? increment() : decrement(), 900);

const onTransitionEnd = (event) => {
  if(event.propertyName === 'transform') {
    list.value.push(0);
    if(list.value.length === itemRefs.value.length) {
      isContentShow.value = true;
    }
  }
};

onMounted(() => {
  setRefs(itemRefs.value);
  isReady.value = true;
  window.addEventListener("wheel", throttled);
})

const isShowContentItems = i => {
   return isActive(i) && isContentShow.value
}

let touchEvent = null;

document.addEventListener('touchstart', event => touchEvent = new TouchEvent(event));
document.addEventListener('touchend', event => {
  if (!touchEvent) return
  touchEvent.setEndEvent(event);
  if (touchEvent.isSwipeUp() || touchEvent.isSwipeRight()) {
    decrement()
  } else if (touchEvent.isSwipeDown() || touchEvent.isSwipeLeft()) {
    increment()
  }
  touchEvent = null;
});
</script>
<template>
  <Competitor :is-active="isReady" :activeIndex="activeIndex"/>
  <div class="carousel">
    <div v-for="(item, i) in stadiums"
         class="carousel-item"
         @click="setItem(i)"
         :class="{'carousel-active': isActive(i), 'carousel-small': isSmall(i)}"
         :style="getStyle(i)"
         :key="i"
         @transitionend="onTransitionEnd"
         ref="itemRefs">
      <div class="carousel-hexagon">
        <div class="carousel-content" :class="{'carousel-content--show': isContentShow}">
          <div v-if="isShowContentItems(i)" class="carousel-text carousel-place">{{ item.place }}</div>
          <div class="carousel-text carousel-date">{{ item.date }}</div>
          <div v-if="isShowContentItems(i)" class="carousel-text carousel-time">{{ item.time }}</div>
          <button v-if="isShowContentItems(i)" class="carousel-button">Купить билет</button>
        </div>
      </div>
    </div>
  </div>
</template>

