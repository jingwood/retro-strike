
const playerName = ref('')
const startTime = ref(Date.now())
const maxCombo = ref(0)

const elapsedTime = ref(0)
const formattedElapsedTime = computed(() => formatSecondsToTime(elapsedTime.value))

export function setPlayerName(name) {
  playerName.value = name
  window.localStorage.setItem('playerName', name)
}

export async function submitScore({playerName, score, elapsedTime}) {
  await addDoc(collection(db, 'scores'), {
    name: newName,
    score: props.score,
    elapsedTime: props.elapsedTime,
    createdAt: serverTimestamp()
  })
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
  }
}

