import {
  InputRef, Flex, Input, Button,
} from 'antd'
import { useRef, useCallback, useEffect } from 'react'

export const EditFilterName = ({
  filterName, setFilterName, handleFilterNameSave, setEditFilterName, setIsNewFilterSave,
}: {
  filterName: string,
  setFilterName: (name: string) => void,
  handleFilterNameSave: () => void,
  setEditFilterName: (edit: boolean) => void,
  setIsNewFilterSave: (save: boolean) => void,
}) => {
  const inputRef = useRef<InputRef>(null)

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value)
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [filterName])

  return (
    <Flex gap={8}>
      <Input
        ref={inputRef}
        required
        value={filterName}
        style={{ width: '320px' }}
        onChange={handleInputChange}
        placeholder="Enter filter name"
        variant="borderless"
      />
      <Button disabled={!filterName.trim()} type="primary" onClick={handleFilterNameSave}>Save</Button>
      <Button onClick={() => { setEditFilterName(false); setIsNewFilterSave(false) }}>Cancel</Button>
    </Flex>
  )
}
