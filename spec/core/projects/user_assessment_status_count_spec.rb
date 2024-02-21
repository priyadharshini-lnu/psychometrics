# frozen_string_literal: true

require 'rails_helper'

describe Projects::UserAssessmentStatusCount do
  it 'returns user_assessment count by status' do
    campaign = create(:campaign)
    workshop_activities = create_list(:campaign_assessment, 3, campaign: campaign, workshop_activity: true)
    non_workshop_activity = create(:campaign_assessment, campaign: campaign, workshop_activity: false)
    user = create(:user)
    create(
      :user_assessment, campaign: campaign,
      subject: user, evaluator: user,
      assessment: workshop_activities[0].assessment, status: :completed
    )
    create(
      :user_assessment, campaign: campaign,
      subject: user, evaluator: user,
      assessment: workshop_activities[1].assessment, status: :completed
    )
    create(
      :user_assessment, campaign: campaign,
      subject: user, evaluator: user,
      assessment: workshop_activities[2].assessment, status: :in_progress
    )
    create(
      :user_assessment, campaign: campaign,
      subject: user, evaluator: user,
      assessment: non_workshop_activity.assessment, status: :completed
    )

    result = described_class.call!(campaign.project, UserAssessment.workshop_activities(true))

    expect(result[[campaign.id, user.id]]).to eq({ 'total' => 3, 'completed' => 2, 'in_progress' => 1 })
  end
end
