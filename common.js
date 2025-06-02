
const playerName = ref('')
const startTime = ref(Date.now())

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

export function useCommonData() {
    return {
        playerName,
        startTime,
    }
}

