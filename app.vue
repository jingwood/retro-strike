<template lang="pug">
div(class='relative min-h-screen')
  img(class='absolute inset-0 left-0 top-0 w-full h-full object-cover' src='/images/background1.jpg')
  div(class='absolute left-0 top-0 right-0 bottom-0 flex items-center justify-center')
    canvas(ref="canvasEl" class='bg-zinc-900/80 rounded-lg' :style='{ width: canvasWidth + "px", height: canvasHeight + "px" }'
      :width="canvasWidth", :height="canvasHeight")

  div(class='fixed top-0 w-full py-6 flex flex-col items-center justify-center')
    div(class='text-3xl')
      light-board(:mode='["playing", "win"].includes(gameState) ? "forward" : "blink"' :speed='gameState === "win" ? 100 : 1000')
    h1(class='uppercase text-gray-200 font-bold text-5xl font-rubik') Retro Strike
    div(class='text-3xl')
      light-board(:mode='["playing", "win"].includes(gameState) ? "forward" : "blink"' :speed='gameState === "win" ? 100 : 1000')
    div(class='flex flex-row gap-12 text-xl py-4')
      div(class='text-yellow-300') {{ elapsedTime }}
      div(class='text-red-300') {{ String(score).padStart(5, '0') }}

  div(class='fixed left-0 top-0 w-full h-full flex items-center justify-center')
    div(class='flex flex-col justify-center gap-6 animate-pulse' v-if="gameState === 'ready'")
      button(@click="startGame" class='text-3xl bg-white hover:bg-amber-200 text-black px-4 py-2 rounded uppercase font-rubik') Start
      div(class='uppercase') Or press mouse button to start

    div(class='flex flex-col items-center justify-center rounded-xl bg-yellow-700/90 px-12 py-8 gap-6' v-if="gameState === 'win'")
      div(class='text-yellow-300 text-3xl uppercase') Victory!
      div
        | You have defeated all enemies in {{ elapsedTime }}!
      score-post(:score='score' :elapsedTime='elapsedTime')
      button(@click="restartGame" class='bg-white text-black px-4 py-2 rounded uppercase hover:bg-amber-200 font-rubik') Restart

    div(class='flex flex-col items-center justify-center gap-4 rounded-xl bg-red-100/70 px-12 py-8' v-if="gameState === 'lose'")
      div.text-red-500.text-2xl.mb-4.uppercase(class='animate-pulse') Game Over
      score-post(:score='score' :elapsedTime='elapsedTime')
      button(@click="restartGame" class='text-2xl bg-white text-black hover:bg-amber-200 font-rubik' animate-pulse) Retry

  div(class='fixed bottom-0 left-0 right-0 text-center text-gray-400 text-sm p-4 flex items-center justify-center gap-8')
    div Made with ❤️ by Jingwood
    div(class='flex items-center gap-1')
      icon(name='humbleicons:brand-github')
      NuxtLink(class='hover:text-gray-300' to='https://github.com/jingwood/retro-strike' target='_blank') See on GitHub

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { setPlayerName, useCommonData } from '@/common'

const canvasWidth = 800
const canvasHeight = 600

const canvasEl = ref(null)
const gameState = ref('win') // 'ready', 'playing', 'win', 'lose'
const elapsedTime = ref('00:00')
const score = ref(0)

const { playerName, startTime } = useCommonData()

const player = {
  x: canvasWidth / 2 - 20,
  y: canvasHeight - 60,
  width: 40,
  height: 40,
}

// Bullets array to track bullets
const bullets = []
// Enemy bullets array
const enemyBullets = []

const enemies = []
const cols = 8
const rows = 3
const spacingX = 20
const spacingY = 50
const offsetY = 40
const enemyWidth = 40
const enemyHeight = 40
const enemyTotalCount = rows * cols

// Initialize enemies in a grid
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    enemies.push({
      width: enemyWidth,
      height: enemyHeight,
      hit: false,
    })
  }
}

function resetAllEnemies() {
  let index = 0
  // Center the enemy grid based on canvasWidth
  const totalWidth = cols * enemyWidth + (cols - 1) * spacingX
  const halfRowWidth = (canvasWidth - totalWidth) / 2 - spacingX / 2

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const enemy = enemies[index]
      if (enemy) {
        enemy.x = halfRowWidth + col * (enemyWidth + spacingX) + ((row % 2) ? (spacingX + enemyWidth) / 2 : 0)
        enemy.y = offsetY + row * spacingY
        enemy.hit = false
        index++
      }
    }
  }
}
resetAllEnemies()


let ctx, canvas, canvasRect, enemyImage, enemyDirection

function updateBullets() {
  // Update and remove off-screen player bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    bullet.y -= bullet.speed

    if (bullet.y + bullet.height < 0) {
      bullets.splice(i, 1)
    }
  }

  // Update enemy bullets and check for collision with player
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i]
    bullet.y += bullet.speed

    if (bullet.y > canvas.height) {
      enemyBullets.splice(i, 1)
    } else {
      const hit =
        bullet.x < player.x + player.width &&
        bullet.x + bullet.width > player.x &&
        bullet.y < player.y + player.height &&
        bullet.y + bullet.height > player.y

      if (hit) {
        gameState.value = 'lose'
        return
      }
    }
  }
}

function updateEnemies() {
  if (gameState.value !== 'playing') {
    return
  }

  // Collision detection (player bullets to enemies)
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    for (let j = 0; j < enemies.length; j++) {
      const enemy = enemies[j]
      if (enemy.hit) continue

      const hit =
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y

      if (hit) {
        bullets.splice(i, 1)
        enemy.hit = true

        score.value += 10
        break
      }
    }
  }

  // Move enemies horizontally
  let reachedEdge = false
  enemies.forEach(enemy => {
    if (!enemy.hit) {
      enemy.x += enemyDirection * 0.5
      if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
        reachedEdge = true
      }
    }
  })
  // Add vertical descent for enemies when they change direction
  if (reachedEdge) {
    enemyDirection *= -1
    enemies.forEach(enemy => {
      if (!enemy.hit) {
        enemy.y += 10 // Drop down
      }
    })
  }

  const allEnemiesHit = enemies.every(e => e.hit)
  if (allEnemiesHit) {
    gameState.value = 'win'
  }
}

function updateStatus() {
  const now = Date.now()

  const elapsed = Math.floor((now - startTime.value) / 1000)
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')

  elapsedTime.value = `${minutes}:${seconds}`
}

function drawBullets() {
  // Draw player bullets
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i]
    ctx.fillStyle = 'white'
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
  }

  // Draw enemy bullets
  for (let i = 0; i < enemyBullets.length; i++) {
    const bullet = enemyBullets[i]
    ctx.fillStyle = 'red'
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
  }
}

function startGame() {
  gameState.value = 'playing'
  startTime.value = Date.now()
  score.value = 0
}

onMounted(() => {
  let playerName = window.localStorage.getItem('playerName')
  if (!playerName) {
    playerName = 'Player#' + Math.floor(100000 + Math.random() * 100000)
  }
  setPlayerName(playerName)

  canvas = canvasEl.value
  ctx = canvas.getContext('2d')

  canvasRect = canvas.getBoundingClientRect()

  enemyImage = new Image()
  enemyImage.src = '/images/inva1.png'
  enemies.forEach(e => e.image = enemyImage)

  // Load images
  player.image = new Image()
  player.image.src = '/images/spac.png'

  enemyDirection = 1

  // Update player position based on mouse
  window.addEventListener('mousemove', (e) => {
    if (gameState.value !== 'playing') return

    const mouseX = e.clientX - canvasRect.left
    player.x = mouseX - player.width / 2
  })

  // Fire bullets at interval
  setInterval(() => {
    if (gameState.value !== 'playing') return

    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 10,
      speed: 5
    })
  }, 2000)

  // Enemy fires bullets at interval
  setInterval(() => {
    if (gameState.value !== 'playing') return

    const shooters = enemies.filter(e => !e.hit)
    if (shooters.length > 0) {
      const shooter = shooters[Math.floor(Math.random() * shooters.length)]
      const remainEnemyCount = enemies.filter(e => !e.hit).length
      enemyBullets.push({
        x: shooter.x + shooter.width / 2 - 2,
        y: shooter.y + shooter.height,
        width: 4,
        height: 10,
        speed: 1 + (Math.random() * 2) + (enemyTotalCount - remainEnemyCount) * 0.2 // Random speed between 3 and 5
      })
    }
  }, 100)

  doFrame()
})

function drawEnemies() {
  enemies.forEach(enemy => {
    if (!enemy.hit) {
      ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height)
    }
  })
}

function drawPlayer() {
  ctx.drawImage(player.image, player.x, player.y, player.width, player.height)
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawEnemies()
  drawPlayer()
  drawBullets()
}

function doFrame() {
  draw()

  if (gameState.value === 'playing') {
    updateBullets()
    updateEnemies()

    updateStatus()
  }

  requestAnimationFrame(doFrame)
}

function restartGame() {
  // Reset enemies
  resetAllEnemies()

  // Clear bullets
  bullets.length = 0
  enemyBullets.length = 0

  // Reset player position
  player.x = canvasWidth / 2 - player.width / 2

  // Restart
  startGame()
}

</script>
