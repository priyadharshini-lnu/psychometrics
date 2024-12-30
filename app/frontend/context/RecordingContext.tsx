import React, {
  createContext, useContext, useState, ReactNode,
} from 'react'

interface RecordingContextType {
  isRecording: boolean;
  startVideoRecording: () => void;
  stopVideoRecording: () => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined)

export const useRecording = (): RecordingContextType => {
  const context = useContext(RecordingContext)
  if (!context) {
    throw new Error('useRecording must be used within a RecordingProvider')
  }
  return context
}

interface RecordingProviderProps {
  children: ReactNode;
}

export const RecordingProvider: React.FC<RecordingProviderProps> = ({ children }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false)

  const startVideoRecording = () => {
    setIsRecording(true)
  }

  const stopVideoRecording = () => {
    setIsRecording(false)
  }

  return (
    <RecordingContext.Provider value={{ isRecording, startVideoRecording, stopVideoRecording }}>
      {children}
    </RecordingContext.Provider>
  )
}
