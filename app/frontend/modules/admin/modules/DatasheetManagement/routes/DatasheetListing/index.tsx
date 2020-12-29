import React, { useEffect } from 'react'

import { connect, ConnectedProps } from 'react-redux'
import { get as getDatasheetList, fetch } from 'modules/admin/modules/DatasheetManagement/core/list'
import { get as getTotal } from 'modules/admin/modules/DatasheetManagement/core/total'
import { get as getParentResource } from 'modules/admin/modules/DatasheetManagement/core/parentResource'
import { RootState } from 'modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    list: getDatasheetList(state),
    total: getTotal(state),
    parentResource: getParentResource(state),
  }),
  {
    fetch,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = PropsFromRedux

const DatasheetListing: React.FC<Props> = ({
  list, total, parentResource, fetch,
}) => {
  useEffect(() => {
    const { id: parentResourceId, type: parentResourceType } = parentResource
    if (parentResourceId && parentResourceType) {
      fetch(parentResourceType, parentResourceId)
    }
  }, [])

  return (
    <>
      <div>Main component here</div>
      <div>Dummy data from server below</div>
      <div>
        Total:
        { total }
      </div>
      <div>
        Datasheet:
        { JSON.stringify(list, null, 2) }
      </div>
    </>
  )
}

export default connecter(DatasheetListing)
