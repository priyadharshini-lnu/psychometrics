import {
  render, screen, waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CampaignFactorsComponent as CampaignFactors } from '~/modules/reports/components/modals/ReportSettings/CampaignFactors'

describe('CampaignFactors', () => {
  const columns = [
    { name: 'Field1', code: 'field1', outputType: 'string' },
    { name: 'Field2', code: 'field2', outputType: 'numeric' },
  ]

  const saveCampaignFactorsMock = vi.fn()
  const closeMock = vi.fn()

  it('should render the CampaignFactors component', () => {
    render(
      <CampaignFactors
        columns={columns}
        saveCampaignFactors={saveCampaignFactorsMock}
      />,
    )
    expect(screen.getByText('Campaign Factors')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('Name')).toHaveLength(2)
    expect(screen.getAllByPlaceholderText('Code')).toHaveLength(2)
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
    expect(screen.getByText('Add Field')).toBeInTheDocument()
    expect(screen.getByText('Update')).toBeInTheDocument()
  })

  // Checks if the saveCampaignFactors and close functions are called when the Save button is clicked with valid input.
  it('should call saveCampaignFactors when submitting with valid input', async () => {
    render(
      <CampaignFactors
        columns={columns}
        saveCampaignFactors={saveCampaignFactorsMock}
      />,
    )

    userEvent.click(screen.getByText('Update'))
    await waitFor(() => {
        expect(saveCampaignFactorsMock).toHaveBeenCalled()
    })
  })

    // Renders the CampaignFactors component and checks if a new field is added when clicking the "Add Field" button.


  it('should add a new field when clicking the "Add Field" button', async () => {
    render(
      <CampaignFactors
        columns={columns}
        saveCampaignFactors={saveCampaignFactorsMock}
      />,
    )
    userEvent.click(screen.getByText('Add Field'))
    await waitFor(() => {
    expect(screen.getAllByPlaceholderText('Name')).toHaveLength(3)
    expect(screen.getAllByPlaceholderText('Code')).toHaveLength(3)
    expect(screen.getAllByRole('combobox')).toHaveLength(3)
    })
  })

    // Renders the CampaignFactors component with multiple fields and checks if a field is removed when clicking the "Remove" button.


  it('should remove a field when clicking the "Remove" button', async () => {
    render(
      <CampaignFactors
        columns={columns}
        close={closeMock}
        saveCampaignFactors={saveCampaignFactorsMock}
      />,
    )
    userEvent.click(screen.queryAllByTestId('remove-button')[0])
    await waitFor(() => {
    expect(screen.getAllByPlaceholderText('Name')).toHaveLength(1)
    expect(screen.getAllByPlaceholderText('Code')).toHaveLength(1)
    expect(screen.getAllByRole('combobox')).toHaveLength(1)
    })
  })

})
