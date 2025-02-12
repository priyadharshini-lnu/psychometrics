import create from 'zustand'

interface StoreState {
  nextTimeout: Record<string, string | null>;
  setNextTimeoutValue: (userId: string, value: string | null) => void;
}

export const useSessionTimeoutStore = create<StoreState>(set => ({
  nextTimeout: {},
  setNextTimeoutValue: (userId, value) => {
    set((state) => {
      if (state.nextTimeout[userId] !== value) {
        channel.postMessage({ userId, value })
        return { nextTimeout: { ...state.nextTimeout, [userId]: value } }
      }
      return state
    })
  },
}))

const channel = new BroadcastChannel('nextTimeoutChannel')

channel.onmessage = (event) => {
  const { userId, value } = event.data
  useSessionTimeoutStore.getState().setNextTimeoutValue(userId, value)
}
