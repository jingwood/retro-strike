import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {

  const runtimeConfig = useRuntimeConfig()

  const axiosLocal = axios.create({
    baseURL: runtimeConfig.public.apiBase,
    headers: {
    },
  })

  return {
    provide: {
      axios: axiosLocal,
    },
  };
});
