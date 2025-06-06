
const playerName = ref('')
const startTime = ref(Date.now())
const score = ref(0)
const elapsedTime = ref(0)
const maxCombo = ref(0)
const formattedElapsedTime = computed(() => formatSecondsToTime(elapsedTime.value))

const showLeaderboard = ref(false)
const lastSubmittedScore = ref(null)

export function setPlayerName(name) {
  playerName.value = name
  window.localStorage.setItem('playerName', name)
}

export function formatSecondsToTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')

  return `${minutes}:${seconds}`
}

export function useCommonData() {
  return {
    playerName,
    startTime,
    score,
    maxCombo,
    elapsedTime,
    formattedElapsedTime,

    showLeaderboard,
    lastSubmittedScore,
  }
}

export function useAPI($axios) {
  return {
    async submitScore() {
      const ret = await $axios.post('/retro-strike/v1/submit-score/', {
        playerName: playerName.value,
        score: score.value,
        elapsedTime: elapsedTime.value,
        maxCombo: maxCombo.value,
      })

      if (ret.status === 201 && ret.data.status === 'success') {
        lastSubmittedScore.value = ret.data.id
        return true
      }
    },

    async getLeaderboard() {
      const ret = await $axios.get('/retro-strike/v1/leaderboard/')
      if (ret.data.status === 'success') {
        return ret.data
      }
      return []
    },
  }
}
