
const playerName = ref('')
const startTime = ref(Date.now())
const maxCombo = ref(0)

const elapsedTime = ref(0)
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
    maxCombo,
    elapsedTime,
    formattedElapsedTime,

    showLeaderboard,
    lastSubmittedScore,
  }
}

export function useAPI($axios) {
  return {
    async submitScore({playerName, score, elapsedTime, maxCombo}) {
      const ret = await $axios.post('/retro-strike/v1/submit-score/', {
        playerName,
        score,
        elapsedTime,
        maxCombo,
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
