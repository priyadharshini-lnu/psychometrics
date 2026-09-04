import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Evaluation from '~/modules/admin/modules/AssessorApp/routes/Evaluation'

vi.mock('~/modules/admin/modules/campaigns/components/Breadcrumb', () => ({
  default: () => null,
}))

vi.mock('~/modules/admin/modules/AssessorApp/routes/Evaluation/Overview', () => ({
  default: () => null,
}))

vi.mock('~/modules/admin/modules/AssessorApp/routes/Evaluation/UserAssessment', () => ({
  default: () => null,
}))

vi.mock('~/modules/admin/modules/AssessorApp/routes/Evaluation/AssessorAssessment', () => ({
  default: ({ userAssessmentId }: { userAssessmentId: number }) => (
    <span data-testid="assessor-form">{userAssessmentId}</span>
  ),
}))

const CAMPAIGN_ID = 7
const PREVIOUS_USER_ID = 11
const CURRENT_USER_ID = 22
const ASSESSMENT_ID = 1774
const PREVIOUS_EVALUATION_ID = 40498

const renderEvaluation = (loadedUserId: number) => {
  const store = configureStore({
    reducer: () => ({
      assessors: {
        evaluation: {
          userId: loadedUserId,
          userInfo: { user: { id: loadedUserId, name: 'user', email: 'user@example.com' } },
          currentAssessorFormId: ASSESSMENT_ID,
          currentAssessmentId: null,
          assessorAssessments: {
            [ASSESSMENT_ID]: [{
              id: PREVIOUS_EVALUATION_ID,
              assessment_id: ASSESSMENT_ID,
              linked_assessment_id: 0,
              name: 'Scoring - Assessor form',
              status: 'in_progress',
              allow_multiple_responses: false,
              completed_at: '',
            }],
          },
          subjectAssessments: [],
          loaded: true,
          assessorForms: {},
          subjectForms: {},
        },
      },
    }),
  })

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/assessors/campaigns/${CAMPAIGN_ID}/evaluations/${CURRENT_USER_ID}`]}>
        <Routes>
          <Route path="/assessors/campaigns/:campaignId/evaluations/:userId" element={<Evaluation />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('AssessorApp Evaluation', () => {
  it('withholds the form while the loaded evaluation belongs to another user', () => {
    renderEvaluation(PREVIOUS_USER_ID)

    expect(screen.queryByTestId('assessor-form')).not.toBeInTheDocument()
  })

  it('renders the form once the loaded evaluation belongs to the current user', () => {
    renderEvaluation(CURRENT_USER_ID)

    expect(screen.getByTestId('assessor-form')).toHaveTextContent(`${PREVIOUS_EVALUATION_ID}`)
  })
})
