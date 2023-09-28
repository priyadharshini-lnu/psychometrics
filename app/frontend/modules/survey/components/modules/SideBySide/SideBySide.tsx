import { FC } from 'react'

import { BuilderModel } from '~/modules/survey/interfaces/questions/SideBySide'

import useForceUpdate from '~/hooks/useUpdate'
import TextEditor from '~/modules/survey/components/TextEditor'
import TableHeader from './components/TableHeader'
import TableBody from './components/TableBody'

interface Props {
  model: BuilderModel
}

const SideBySide: FC<Props> = ({ model }) => {
  const forceUpdate = useForceUpdate()

  const { props: { questionText } } = model

  const handleOnTextChange = (value: string) => {
    model.changeProps({ questionText: value })
    forceUpdate()
  }

  const update = () => {
    forceUpdate()
  }

  return (
    <div>
      <div className="mt-4">
        <TextEditor
          value={questionText}
          onChange={handleOnTextChange}
        />
      </div>
      <table>
        <TableHeader model={model} onChange={update} />
        <TableBody model={model} />
      </table>
    </div>
  )
}

export default SideBySide
