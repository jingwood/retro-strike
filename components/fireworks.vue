<template>
  <canvas ref="canvas" class="fireworks-canvas" @click="launchFirework" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref(null)
let ctx = null
let animationId = null
const particles = []

function createFirework(x, y) {
  const count = 50 + Math.floor(Math.random() * 30)
  const color = `hsl(${Math.random() * 360}, 100%, 70%)`

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = Math.random() * 4 + 2
    particles.push({
      x,
      y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 120,
      color,
    })
  }
}

function launchFirework(e) {
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  createFirework(x, y)
}

function update() {
  if (document.hidden) {
    animationId = requestAnimationFrame(update)
    return
  }

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.dx
    p.y += p.dy
    p.life++

    const alpha = 1 - p.life / p.maxLife
    ctx.beginPath()
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
    ctx.fillStyle = p.color.replace('70%)', `${alpha * 100}%)`)
    ctx.fill()

    if (p.life >= p.maxLife) {
      particles.splice(i, 1)
    }
  }

  animationId = requestAnimationFrame(update)
}

onMounted(() => {
  const c = canvas.value
  c.width = window.innerWidth
  c.height = window.innerHeight
  ctx = c.getContext('2d', { alpha: true })

  setInterval(() => {
    if (document.hidden) return

    const x = Math.random() * c.width
    const y = Math.random() * c.height * 0.5
    createFirework(x, y)
  }, 300)

  update()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.fireworks-canvas {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  pointer-events: none; /* 背後の要素にクリックを通す */
}
</style>
