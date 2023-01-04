import { axiosAuth, useData } from './'

export function useRegister(register_id) {
  return useData(`register/${register_id}`, 'register')
}

export function useRegisters() {
  return useData(`register`, 'registers')
}

export function useCurrentRegisterId() {
  return useData(`register/id`, 'registerId')
}

export function useSetRegisterId(setCart) {
  console.log('calling usesetregister')
  return axiosAuth.get('/api/register/id').then((registerId) => {
    console.log('Setting register id', registerId)
    setCart({ registerId })
  })
}

export function useCurrentRegister() {
  return useData(`register/current`, 'currentRegister')
}

export function savePettyCash(pettyCash) {
  return axiosAuth
    .post(`/api/register/pettycash`, pettyCash)
    .then((res) => {
      return res.data
    })
    .catch((e) => Error(e.message))
}
