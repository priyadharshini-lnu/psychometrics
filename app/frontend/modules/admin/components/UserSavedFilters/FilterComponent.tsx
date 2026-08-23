import { Col, Flex, Row } from 'antd'
import { EditFilterName } from './EditFilterName'

export const FilterComponent = ({
  editFilterName, isNewFilterSave, filterName, setFilterName,
  handleFilterNameSave, setEditFilterName, setIsNewFilterSave,
  selectedFilterId, getFilterName, EditAndDeleteControls, RenderTags, selectedFilters, Actions, SavedFiltersDropdown,
}: {
  editFilterName: boolean,
  isNewFilterSave: boolean,
  filterName: string,
  setFilterName: (name: string) => void,
  handleFilterNameSave: () => void,
  setEditFilterName: (edit: boolean) => void,
  setIsNewFilterSave: (save: boolean) => void,
  selectedFilterId: string,
  getFilterName: (id: string) => string,
  EditAndDeleteControls: () => JSX.Element | null,
  RenderTags: () => JSX.Element,
  selectedFilters: { [key: string]: string[] | string },
  Actions: () => JSX.Element,
  SavedFiltersDropdown: () => JSX.Element,
}) => (
  <>
    <Flex align="baseline" className="m-4">
      {
        editFilterName || isNewFilterSave
          ? (
            <EditFilterName
              filterName={filterName}
              setFilterName={setFilterName}
              handleFilterNameSave={handleFilterNameSave}
              setEditFilterName={setEditFilterName}
              setIsNewFilterSave={setIsNewFilterSave}
            />
          )
          : (
            <>
              {
                Object.keys(selectedFilters).length !== 0
                && (
                  <>
                    <b>{getFilterName(selectedFilterId)}</b>
                    <EditAndDeleteControls />
                  </>
                )
              }
            </>
          )
      }
    </Flex>
    <Row justify="space-between" align="middle" className="m-4">
      <Col>
        <Flex gap={4} align="baseline" wrap="wrap">
          <RenderTags />
          {
            Object.keys(selectedFilters).length !== 0
            && (
              <Actions />
            )
          }
        </Flex>
      </Col>
      <Col>
        <SavedFiltersDropdown />
      </Col>
    </Row>
  </>
)
