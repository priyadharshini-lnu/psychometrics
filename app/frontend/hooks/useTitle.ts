import { useCallback, useEffect, useRef } from 'react'

interface TitleProps {
  title: string;
  setOldTitleOnUnmount?: boolean;
}

interface TitleResponse {
  title: string
  setTitle: (newTitle: string) => void;
}


const useTitle: (props: TitleProps) => TitleResponse = ({ title, setOldTitleOnUnmount = false }) => {
  const initialTitle = useRef<string>()

  const setTitle = useCallback((title) => {
    document.title = title
  }, [])

  useEffect(() => {
    initialTitle.current = document.title
  }, [])

  useEffect(() => {
    if (title) setTitle(title)
    return () => {
      if (setOldTitleOnUnmount) { setTitle(initialTitle.current) }
    }
  }, [setTitle, title, initialTitle.current, setOldTitleOnUnmount])

  return {
    title,
    setTitle,
  }
}

export default useTitle
