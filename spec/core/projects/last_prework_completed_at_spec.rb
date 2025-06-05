# frozen_string_literal: true

require 'rails_helper'

describe Projects::LastPreworkCompletedAt do
  it 'returns completed_at of last completed prework activity' do
    campaign = create(:campaign)
    prework_activity1 = create(:campaign_assessment, campaign: campaign, prework: true)
    prework_activity2 = create(:campaign_assessment, campaign: campaign, prework: true)
    non_prework = create(:campaign_assessment, campaign: campaign, prework: false)

    user = create(:user)
    create(
      :user_assessment, prework: true, campaign: campaign,
      subject: user, evaluator: user,
      assessment: prework_activity1.assessment, status: :completed, completed_at: 2.days.ago
    )
    create(
      :user_assessment, prework: true, campaign: campaign,
      subject: user, evaluator: user,
      assessment: prework_activity2.assessment, status: :completed, completed_at: 3.days.ago
    )
    create(
      :user_assessment, campaign: campaign,
      subject: user, evaluator: user,
      assessment: non_prework.assessment, status: :completed, completed_at: 1.day.ago
    )

    result = described_class.call!(campaign.project)
    expect(result[[campaign.id, user.id]]).to eq(2.days.ago)
  end
end
