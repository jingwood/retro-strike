<template lang="pug">
div(class='flex flex-col items-center justify-center gap-4')

  div(class='flex flex-col items-center justify-center gap-4 text-gray-300')
    div(class='text-white')
      div(class='score-item')
        div(class='') Score:
        div(class='') {{ score }}
      div(class='score-item')
        div Time:
        div {{ formattedElapsedTime }}
      div(class='score-item')
        div Max Combo:
        div {{ maxCombo }}

  div(v-if='scoreSubmitted' class='text-lime-500 font-bold')
    div Your score has been submitted successfully!

  div(v-if='playerName || scoreSubmitted')
    button(class='px-2 py-1 bg-white/70 hover:bg-amber-200 text-black'
      @click='showLeaderboard = true')
      icon(class='text-3xl text-amber-500 animate-pulse' name='humbleicons:crown')
      div See Leaderboard

  div(v-if='isGuest && !scoreSubmitted' class='flex flex-col items-center justify-center gap-4 py-4')
    div(class='text-xl text-yellow-300 font-bold animate-bounce') Share Your Score!
    input(type='text' v-model='inputPlayerName' tabIndex=0
      class='border border-gray-500 bg-gray-800/50 rounded px-4 py-2 w-64 text-center'
      placeholder='Enter your name' @keyup.enter='submit')
    div(class='text-red-200' v-if='errorMessage') {{ errorMessage }}
    button(@click='submit' class='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
      :class='inputPlayerName.trim() === "" ? "opacity-50 cursor-not-allowed" : ""'
      :disabled='sending || inputPlayerName.trim() === ""')
      div(v-if='sending' class='')
        icon(name='fa6-solid:spinner' class='animate-spin')
      div(v-else)
        icon(name='fa6-solid:paper-plane' class='mr-2')
        | Submit


</template>

<style scoped>
@import "tailwindcss";

.score-item {
  @apply min-w-60 flex flex-row items-center justify-center gap-2;

  :first-child {
    @apply basis-1/2 flex-none text-right;
  }
  :last-child {
    @apply basis-1/2 text-left;
  }
}
</style>

<script setup>

import { setPlayerName, useCommonData, useAPI } from '@/common'

const { playerName, score, formattedElapsedTime, maxCombo, showLeaderboard } = useCommonData()
const { submitScore } = useAPI(useNuxtApp().$axios)

const isGuest = computed(() => !playerName.value)

const inputPlayerName = ref('')
const errorMessage = ref('')
const scoreSubmitted = ref(false)

const sending = ref(false)

async function submit() {
  const newName = inputPlayerName.value.trim()

  if (newName === '') {
    errorMessage.value = 'Please enter your name.'
    return
  }

  // Update the player name in common data
  playerName.value = newName

  setPlayerName(newName)

  errorMessage.value = ''

  try {
    sending.value = true
    await submitScore()

    scoreSubmitted.value = true
  } catch (err) {
    errorMessage.value = 'Failed to save score. Please try again.'
    console.error(err)
  } finally {
    sending.value = false
  }
}

</script>
