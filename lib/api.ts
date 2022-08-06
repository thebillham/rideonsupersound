import axios from 'axios'
import useSWR from 'swr'
import { fetcher } from './database/read'

export function get(url, params = {}, callback = null) {
  return axios(url, params)
    .then((response) => (callback ? callback(response.data) : response.data))
    .catch((error) => {
      return error.message
    })
}

export async function getUSDExchangeRate() {
  return get(
    `https://api.apilayer.com/exchangerates_data/latest`,
    {
      params: { base: 'USD', symbols: 'NZD' },
      headers: {
        apikey: process.env.NEXT_PUBLIC_API_LAYER_API_KEY,
      },
    },
    (json) => json?.rates?.NZD ?? 1
  )
}

export function useWeather() {
  let loc = 'id=2192362'
  if (navigator?.geolocation) {
    navigator?.geolocation?.getCurrentPosition((position) => {
      loc = `lat=${position.coords.latitude}, lon=${position.coords.longitude}`
    })
  }
  const { data, error } = useSWR(
    `https://api.openweathermap.org/data/2.5/weather?${loc}&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_API}&units=metric`,
    fetcher
  )
  return {
    weather: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export function getGeolocation() {
  let geolocation = null
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      geolocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
    })
  }
  return geolocation
}

export function uploadFiles(files) {
  // const body = new FormData();
  // body.append("file", files);
  try {
    fetch(`/api/upload-file?k=${process.env.NEXT_PUBLIC_SWR_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: files,
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
  } catch (e) {
    throw Error(e.message)
  }
}
