import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import { getI18n } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { RootState } from '~/modules/survey/core/rootReducers'
import { PreviewModel } from '~/modules/survey/interfaces/questions/SideBySide'

import { SafeHTML } from '~/components/SafeHTML'
import TableHeader from './components/TableHeaderPreview'
import TableBody from './components/TableBodyPreview'

const connector = connect(({ preview }: RootState) => ({
  I18n: getI18n(preview),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  model: PreviewModel
  readOnly: boolean
}

type Props = PropsFromRedux & OwnProps

const PreviewComponent: FC<Props> = ({ model, I18n, readOnly }) => (
  <div>
    <SafeHTML
      className="mb-4"
      html={I18n.tQuestion(model, 'questionText')}
      config="adminRichText"
    />
    <table>
      <TableHeader model={model} I18n={I18n} />
      <TableBody model={model} I18n={I18n} readOnly={readOnly} />
    </table>
  </div>
)

export const Preview = connector(PreviewComponent)
