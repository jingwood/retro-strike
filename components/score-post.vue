<template lang="pug">
div
  div(v-if='scoreSubmitted' class='text-lime-800 font-bold flex flex-col items-center justify-center gap-4')
    div Your score has been submitted successfully!
    button(class='px-2 py-1 bg-white/70 hover:bg-amber-200 text-black flexb'
      @click='showLeaderboard = true')
      icon(class='text-3xl' name='humbleicons:crown')
      div See Leaderboard

  div(v-else class='flex flex-col items-center justify-center gap-4 text-gray-300')
    div(class='text-gray-800')
      div(class='score-item')
        div(class='') Score:
        div(class='') {{ props.score }}
      div(class='score-item')
        div Time:
        div {{ formattedElapsedTime }}
      div(class='score-item')
        div Max Combo:
        div {{ maxCombo }}
    div(class='text-xl font-bold') Share Your Score!
    input(type='text' v-model='inputPlayerName' tabIndex=0 class='border border-gray-500 bg-gray-800/50 rounded px-4 py-2 w-64 text-center' placeholder='Enter your name' @keyup.enter='submit')
    div(class='text-red-200' v-if='errorMessage') {{ errorMessage }}
    button(@click='submit' class='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600') Submit


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

const { playerName, startTime, elapsedTime, formattedElapsedTime, maxCombo, showLeaderboard } = useCommonData()

const { $axios } = useNuxtApp()
const { submitScore } = useAPI($axios)

const inputPlayerName = ref(playerName)
const errorMessage = ref('')
const scoreSubmitted = ref(false)

const props = defineProps({
  score: {
    type: Number,
    default: 0
  },
})

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
    if (await submitScore({
      playerName: newName,
      score: props.score,
      elapsedTime: elapsedTime.value,
      maxCombo: maxCombo.value,
    })) {
      scoreSubmitted.value = true
    }
  } catch (err) {
    errorMessage.value = 'Failed to save score. Please try again.'
    console.error(err)
  }
}

</script>
