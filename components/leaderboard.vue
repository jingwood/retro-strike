<template lang="pug">
div(class='bg-zinc-800/50 backdrop-blur-md border-2 border-pink-300 rounded-md shadow-xl p-4 flex items-start justify-center z-10')
  div(class='w-full max-w-2xl mx-auto flex flex-col justify-between h-full')
    div(class='absolute right-0 top-0')
      button(class='hover:bg-gray-500/30 hover:text-gray-200' @click='showLeaderboard=false')
        icon(name='fa6-solid:xmark')
    div(class='flex-none text-center font-rubik font-bold text-2xl text-pink-400 uppercase pb-4')
      | Leaderboard
    div(class='grow w-full h-full')
      div(class=' text-pink-300 text-center flex flex-row justify-center items-center gap-2 p-2 border-b-2 border-pink-500'
        style='height: 2.5rem;')
        div(class='basis-20 flex-none') Rank
        div(class='basis-auto grow') Player
        div(class='basis-30 flex-none') Score
        div(class='basis-30 flex-none') Time
        div(class='basis-20 flex-none pb-2') Max Combo
      div(class='relative')
        div(class='relative max-h-[430px] overflow-y-scroll')
          div(class='absolute inset-0 w-full h-full flex justify-center items-center' v-if='loading')
            icon(name='fa6-solid:spinner' class='animate-spin text-3xl text-gray-400')
            | Loading...
          div(v-for='(record, index) in records' :key='index'
            class='flex flex-row items-center justify-between gap-2 p-2 text-gray-100'
            :class="{'bg-gray-700/30': index % 2 === 0, 'bg-yellow-500/30 animate-pulse': record._id === lastSubmittedScore}")
            div(class='flex-none basis-20 text-center flex justify-center items-center')
              icon(v-if='index==0' class='text-3xl text-amber-400' name='humbleicons:certificate')
              icon(v-else-if='index==1' class='text-3xl text-zinc-300' name='humbleicons:certificate')
              icon(v-else-if='index==2' class='text-3xl text-yellow-800' name='humbleicons:certificate')
              div(v-else) {{ index + 1 }}
            div(class='grow basis-auto text-center') {{ record.playerName }}
            div(class='flex-none basis-30 text-right') {{ record.score }}
            div(class='flex-none basis-30 text-center') {{ formatSecondsToTime(record.elapsedTime) }}
            div(class='flex-none basis-20 text-right') {{ record.maxCombo }}
    div(class='flex-none text-center text-xs')
      | Showing {{ records.length }} of {{ totalRecords }} records

</template>

<style scoped>
th, td {
  padding: 0.5rem;
}
</style>

<script setup>

import { useCommonData, useAPI, formatSecondsToTime } from '@/common'

const { showLeaderboard, lastSubmittedScore } = useCommonData()
const { getLeaderboard } = useAPI(useNuxtApp().$axios)

const records = ref([])
const totalRecords = ref(0)
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    loading.value = true
    const data = await getLeaderboard()
    records.value = data.records
    totalRecords.value = data.totalRecords
  } catch (error) {
    errorMessage.value = 'Failed to load leaderboard'
  } finally {
    loading.value = false
  }
})

</script>
