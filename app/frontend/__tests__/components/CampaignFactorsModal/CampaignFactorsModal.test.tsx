import {
  render, screen, waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CampaignFactors from '~/components/CampaignFactorsModal'

describe('CampaignFactors', () => {
  const columns = [
    { name: 'Field1', code: 'field1', outputType: 'string' },
    { name: 'Field2', code: 'field2', outputType: 'numeric' },
  ]

  const saveCampaignFactorsMock = jest.fn()
  const closeMock = jest.fn()

  it('should render the CampaignFactors component', () => {
    render(
      <CampaignFactors
        columns={columns}
        close={closeMock}
        saveCampaignFactors={saveCampaignFactorsMock}
      />,
    )
    expect(screen.getByText('Campaign factors')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('Name')).toHaveLength(2)
    expect(screen.getAllByPlaceholderText('Code')).toHaveLength(2)
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
    expect(screen.getByText('Add Field')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  // Checks if the close function is called when the Cancel button is clicked.
  it('should call close when Cancel button is clicked', async () => {
    render(
      <CampaignFactors
        columns={columns}
        close={closeMock}
        saveCampaignFactors={saveCampaignFactorsMock}
      />,
    )
    userEvent.click(screen.getByText('Cancel'))
    await waitFor(() => {
    expect(closeMock).toHaveBeenCalled()
    })
  })

  // Checks if the saveCampaignFactors and close functions are called when the Save button is clicked with valid input.
  it('should call saveCampaignFactors and close when submitting with valid input', async () => {
    render(
      <CampaignFactors
        columns={columns}
        close={closeMock}
        saveCampaignFactors={saveCampaignFactorsMock}
      />,
    )

    userEvent.click(screen.getByText('Save'))
    await waitFor(() => {
        expect(saveCampaignFactorsMock).toHaveBeenCalled()
        expect(closeMock).toHaveBeenCalled()
    })
  })

    // Renders the CampaignFactors component and checks if a new field is added when clicking the "Add Field" button.


  it('should add a new field when clicking the "Add Field" button', async () => {
    render(
      <CampaignFactors
        columns={columns}
        close={closeMock}
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
