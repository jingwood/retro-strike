<template lang="pug">

div(class='relative min-h-screen')
  img(class='absolute inset-0 w-full h-full object-cover' src='/images/background1.jpg')
  fireworks(v-if='gameState === "win"' class='absolute inset-0 w-full h-full')
  div(class='absolute inset-0 w-full h-full flex flex-col items-center justify-between')
    div(class='basis-1/3 h-full py-6 flex flex-col items-center justify-around')
      div(class='flex-none text-center')
        div(class='text-3xl')
          light-board(:mode='["playing", "win"].includes(gameState) ? "forward" : "blink"' :speed='gameState === "win" ? 100 : 1000')
        h1(class='uppercase text-gray-200 font-bold text-5xl font-rubik') Retro Strike
        div(class='text-lime-600') Chapter 1
        div(class='text-3xl')
          light-board(:mode='["playing", "win"].includes(gameState) ? "forward" : "blink"' :speed='gameState === "win" ? 100 : 1000')
      div(class='grow flex flex-col items-center justify-around gap-1')
        div(class='')
          div(class='uppercase flex items-center justify-center gap-2 text-amber-300 hover:text-amber-500 cursor-pointer'
            @click='showLeaderboard = true')
            icon(class='text-2xl' name='humbleicons:crown')
            | LeaderBoard
        div(class='flex flex-row gap-12 text-xl font-sixtyfour')
          div(class='text-yellow-300') {{ formattedElapsedTime }}
          div(class='text-red-300') {{ String(score).padStart(5, '0') }}
          div(class='text-gray-300' :class='{"animate-ping": combo>10}' ) x{{ combo }}

    div(class='basis-1/3 relative')
      canvas(class='bg-zinc-900/80 rounded-lg' ref="canvasEl"
        :style='{ width: canvasWidth + "px", height: canvasHeight + "px" }'
        :width="canvasWidth", :height="canvasHeight")

      div(class='absolute inset-0 w-full h-full flex items-center justify-center'
          @click.stop='tryStartGame')
        div(class='flex flex-col justify-center gap-6 animate-pulse' v-if="gameState === 'ready'")
          button(@click="startGame" class='text-3xl bg-white hover:bg-amber-200 text-black px-4 py-2 rounded uppercase font-rubik') Start
          div(class='uppercase') Or press mouse button to start

        div(class='flex flex-col items-center justify-center rounded-xl bg-lime-700/90 px-12 py-8 gap-6' v-if="gameState === 'win'")
          div(class='text-yellow-300 text-3xl uppercase h-6 animate-bounce')
            text-pulse(text='Victory!')
          score-report
          button(@click="restartGame" class='bg-white text-black px-4 py-2 rounded uppercase hover:bg-amber-200 font-rubik') Restart

        div(class='flex flex-col items-center justify-center gap-6 rounded-xl bg-red-300/80 px-12 py-8' v-if="gameState === 'lose'")
          div(class='text-red-500 text-2xl uppercase animate-pulse') Game Over
          score-report
          button(@click="restartGame" class='text-2xl bg-white text-black hover:bg-amber-200 font-rubik' animate-pulse) Retry

        leaderboard(v-if='showLeaderboard'
          class='absolute inset-0 w-full h-full')

    div(class='basis-1/3 text-center text-gray-400 text-xs p-2 flex items-end justify-center gap-8')
      div Made with ❤️ by
        NuxtLink(class='ml-1' to='https://jingwood.me') Jingwood
      div(class='flex items-center gap-1')
        icon(name='humbleicons:brand-github')
        NuxtLink(class='hover:text-gray-300' to='https://github.com/jingwood/retro-strike' target='_blank') See on GitHub


</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCommonData, useAPI } from '@/common'
const { playerName, startTime, elapsedTime, formattedElapsedTime, score, maxCombo, showLeaderboard } = useCommonData()
const { submitScore } = useAPI(useNuxtApp().$axios)

const combo = ref(0) // Combo multiplier
const showScorePost = ref(false) // Show score submission UI

const canvasWidth = 800
const canvasHeight = 600

const canvasEl = ref(null)
const gameState = ref('ready') // 'ready', 'playing', 'win', 'lose'


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
const comboTexts = []

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

function updateBullets(deltaTime) {
  if (gameState.value !== 'playing') {
    return
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    bullet.y -= bullet.speed * deltaTime * 60 // 元のspeedを60fps基準で補正
    if (bullet.y + bullet.height < 0) {
      bullets.splice(i, 1)
      combo.value = 0
    }
  }

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i]
    bullet.y += bullet.speed * deltaTime * 60
    if (bullet.y > canvas.height) {
      enemyBullets.splice(i, 1)
    } else if (checkCollision(bullet, player)) {
      endGame()
      return
    }
  }
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
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
        destroyEnemy(enemy)
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
        enemy.y += 20 // Drop down
      }
    })
  }

  const allEnemiesHit = enemies.every(e => e.hit)
  if (allEnemiesHit) {
    victoryGame()
    return
  }
}

function destroyEnemy(enemy) {
  enemy.hit = true
  combo.value += 1
  score.value += 10 * combo.value // Increase score with combo multiplier

  if (combo.value > maxCombo.value) {
    maxCombo.value = combo.value
  }

  if (combo.value >= 3) {
    comboTexts.push({
      x: enemy.x + enemy.width / 2,
      y: enemy.y,
      combo: combo.value,
      life: 60 // 表示フレーム数（約1秒）
    })
  }
}

function updateStatus() {
  elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
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

function drawCombo() {
  for (let i = comboTexts.length - 1; i >= 0; i--) {
    const item = comboTexts[i]
    ctx.save()
    ctx.font = 'bold 20px sans-serif'
    ctx.fillStyle = 'yellow'
    ctx.textAlign = 'center'
    ctx.fillText(`Combo x${item.combo}`, item.x, item.y)
    ctx.restore()

    item.y -= 1 // 少し上に浮かせる演出
    item.life--

    if (item.life <= 0) {
      comboTexts.splice(i, 1)
    }
  }
}

function startGame() {
  gameState.value = 'playing'
  startTime.value = Date.now()
  score.value = 0
  combo.value = 0
  maxCombo.value = 0

  doFrame()
}

onMounted(() => {
  let storedPlayerName = window.localStorage.getItem('playerName')
  if (storedPlayerName) {
    playerName.value = storedPlayerName
  }

  canvas = canvasEl.value
  ctx = canvas.getContext('2d')

  canvasRect = canvas.getBoundingClientRect()

  enemyImage = new Image()
  enemyImage.src = '/images/inva1.png'
  enemies.forEach(e => e.image = enemyImage)

  // Load images
  player.image = new Image()
  player.image.src = '/images/spac.png'

  Promise.all([
    new Promise(resolve => { player.image.onload = resolve }),
    new Promise(resolve => { enemyImage.onload = resolve })
  ]).then(() => {
    // Images loaded, ready to start rendering
    draw()
  })

  enemyDirection = 1

  // Update player position based on mouse
  window.addEventListener('mousemove', (e) => {
    if (gameState.value !== 'playing') return
    const mouseX = e.clientX - canvasRect.left
    player.x = mouseX - player.width / 2
  })

  // タッチ対応
  window.addEventListener('touchmove', (e) => {
    if (gameState.value !== 'playing') return
    if (e.touches.length === 0) return

    const touchX = e.touches[0].clientX - canvasRect.left
    player.x = touchX - player.width / 2
  }, { passive: true }) // ←スクロール抑制しない（推奨）

  // Fire bullets at interval
  setInterval(() => {
    if (gameState.value !== 'playing') return
    if (document.hidden) return

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
    if (document.hidden) return

    const shooters = enemies.filter(e => !e.hit)
    if (shooters.length > 0) {
      const shooter = shooters[Math.floor(Math.random() * shooters.length)]
      const remainEnemyCount = enemies.filter(e => !e.hit).length
      enemyBullets.push({
        x: shooter.x + shooter.width / 2 - 2,
        y: shooter.y + shooter.height,
        width: 4,
        height: 10,
        speed: 2 + (Math.random() * 5) + (enemyTotalCount - remainEnemyCount) * 0.5 // Random speed between 3 and 5
      })
    }
  }, 100)

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
  drawCombo()
}

let lastTimestamp = 0

function updateGame(deltaTime) {
  updateBullets(deltaTime)
  updateEnemies(deltaTime)
  updateStatus()
}

function doFrame(timestamp) {
  // if (document.hidden) {
  //   return
  // }
  if (!lastTimestamp) lastTimestamp = timestamp
  const deltaTime = (timestamp - lastTimestamp) / 1000 // 秒単位
  lastTimestamp = timestamp

  updateGame(deltaTime)
  draw()

  if (gameState.value === 'playing') {
    console.log('Frame updated')
    requestAnimationFrame(doFrame)
  }
}

function victoryGame() {
  gameState.value = 'win'

  // Stop the game loop
  cancelAnimationFrame(doFrame)

  autoSubmitScore()
}

function endGame() {
  gameState.value = 'lose'

  // Stop the game loop
  cancelAnimationFrame(doFrame)

  autoSubmitScore()
}

async function autoSubmitScore() {
  if (!playerName.value) {
    showScorePost.value = true
    return
  }

  // Show score submission UI
  await submitScore()
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

function tryStartGame() {
  if (gameState.value === 'ready') {
    startGame()
  }
}


useSeoMeta({
  title: 'Retro Strike - A Retro Space Shooter Game',
  ogSiteName: 'Retro Strike',
  ogType: 'website',
  ogTitle: 'Retro Strike - A Retro Space Shooter Game',
  description: 'Play Retro Strike, a retro-style space shooter game. Defeat waves of enemies, achieve high scores, and submit your score to the leaderboard!',
  ogDescription: 'Play Retro Strike, a retro-style space shooter game. Defeat waves of enemies, achieve high scores, and submit your score to the leaderboard!',
  meta: [
    { name: 'description', content: 'Play Retro Strike, a retro-style space shooter game. Defeat waves of enemies, achieve high scores, and submit your score to the leaderboard!' },
    { name: 'keywords', content: 'retro, space shooter, game, leaderboard, high score' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  ogImage: 'https://retro-strike.jingwood.me/images/og-image.jpg',
  ogUrl: 'https://retro-strike.jingwood.me',
})

</script>
