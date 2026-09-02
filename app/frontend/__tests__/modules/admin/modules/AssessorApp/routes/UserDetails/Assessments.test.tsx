import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import Assessments from '~/modules/admin/modules/AssessorApp/routes/UserDetails/Assessments'
import { UserAssessment, UserAssessmentStatus } from '~/modules/admin/modules/AssessorApp/core/userAssessments'

vi.mock('~/modules/admin/modules/AssessorApp/routes/UserDetails/ReportList', () => ({
  default: () => <div data-testid="report-list" />,
}))

const CAMPAIGN_ID = 7
const USER_ID = 9

const assessment = (id: number, status: UserAssessmentStatus): UserAssessment => ({
  id,
  assessmentId: id * 10,
  assessmentName: `Assessment ${id}`,
  status,
  responsesCount: 1,
})

const Location = () => {
  const { pathname, search } = useLocation()

  return <span data-testid="location">{`${pathname}${search}`}</span>
}

const renderAssessments = (userAssessments: UserAssessment[]) => {
  const store = configureStore({
    reducer: () => ({
      request: { requests: [] },
      assessors: {
        users: { current: { id: USER_ID, assessorCanModerateScores: false } },
        userAssessments,
      },
    }),
  })

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/assessors/campaigns/${CAMPAIGN_ID}/users/${USER_ID}`]}>
        <Location />
        <Routes>
          <Route path="/assessors/campaigns/:campaignId/users/:userId" element={<Assessments />} />
          <Route path="/assessors/campaigns/:campaignId/evaluations/:userId" element={<div />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

const currentLocation = () => screen.getByTestId('location').textContent

describe('AssessorApp UserDetails Assessments', () => {
  it('offers a plain evaluation while any assessment is unfinished', async () => {
    renderAssessments([assessment(1, 'completed'), assessment(2, 'in_progress')])

    const button = screen.getByRole('button', { name: I18n.t('assessments.actions.evaluate') })
    await userEvent.click(button)

    expect(currentLocation()).toEqual(`/assessors/campaigns/${CAMPAIGN_ID}/evaluations/${USER_ID}`)
  })

  it('offers a re-evaluation with the edit param once every assessment is completed', async () => {
    renderAssessments([assessment(1, 'completed'), assessment(2, 'completed')])

    const button = screen.getByRole('button', { name: I18n.t('assessments.actions.reevaluate') })
    await userEvent.click(button)

    expect(currentLocation()).toEqual(`/assessors/campaigns/${CAMPAIGN_ID}/evaluations/${USER_ID}?edit=true`)
  })

  it('offers a plain evaluation when the subject has no assessments yet', () => {
    renderAssessments([])

    expect(screen.getByRole('button', { name: I18n.t('assessments.actions.evaluate') })).toBeInTheDocument()
  })
})
