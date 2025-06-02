<template lang="pug">

icon(v-for='(light, i) in lights' :key='i'
  name='humbleicons:bulb-off'
  :style="{ color: light.colorIndex == -1 ? 'black' : colors[light.colorIndex] }")

</template>

<script setup>

const lightCount = 20 // Number of lights
const lights = ref([])
const colors = [
  '#FF5733', // Red
  '#33FF57', // Green
  '#3357FF', // Blue
  '#F1C40F', // Yellow
  '#8E44AD', // Purple
  '#E67E22', // Orange
  '#2ECC71', // Emerald
  '#3498DB', // Sky Blue
  '#9B59B6', // Amethyst
  '#F39C12'  // Carrot
]

let forwardAllLightThread = null
let blinkOn = true

const props = defineProps({
  speed: {
    type: [Number, String],
    default: 1000,
  },
  mode: {
    type: String,
    default: 'blink', // 'blink' or 'forward'
  },
})

const currentSpeed = computed(_ => props.speed)

watch(currentSpeed, (newSpeed) => {
  if (forwardAllLightThread) {
    clearInterval(forwardAllLightThread)
  }
  forwardAllLightThread = setInterval(() => {
    nextFrame()
  }, newSpeed)
})


function nextFrame() {
  if (props.mode === 'blink') {
    if (blinkOn) {
      // Randomly turn off lights
      lights.value.forEach(light => {
        light.colorIndex = -1 // Turn off light
      })
    } else {
      // Randomly turn on lights with a color
      lights.value.forEach(light => {
        light.colorIndex = Math.floor(Math.random() * colors.length)
      })
    }
    blinkOn = !blinkOn
  } else if (props.mode === 'forward') {
    // Shift colors forward
    shiftColorsForward()
  }
}

function shiftColorsForward() {
  if (lights.value.length === 0) return

  for (let i = lights.value.length - 1; i >= 0; i--) {
    if (i === 0) {
      lights.value[i].colorIndex = Math.floor(Math.random() * colors.length)
    } else {
      lights.value[i].colorIndex = lights.value[i - 1].colorIndex
    }
  }
}

onMounted(() => {
  // Initialize lights with random positions and colors
  for (let i = 0; i < lightCount; i++) {
    lights.value.push({
      colorIndex: Math.floor(Math.random() * colors.length),
    })
  }

  forwardAllLightThread = setInterval(nextFrame, props.speed)
})


</script>
