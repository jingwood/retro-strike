<template lang="pug">
div(class="animated-text flex flex-col items-center justify-center")
  div(class='relative')
    div(class='inline-block'
      v-for="(char, index) in characters"
      :key="index"
      :class="{ 'animate-ping': index === currentIndex }")
      | {{ char }}

</template>

<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: 'VICTORY!',
  },
  interval: {
    type: Number,
    default: 200, // ms
  },
  baseSize: {
    type: Number,
    default: 20,
  },
  activeSize: {
    type: Number,
    default: 30,
  },
})

const characters = props.text.split('')
const currentIndex = ref(0)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % characters.length
  }, props.interval)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>

.animated-text div {
  font-size: 30px;
  transition: font-size 0.3s ease, color 0.3s ease;
}

.animated-text div.active {
  font-size: 100px;
}
</style>
