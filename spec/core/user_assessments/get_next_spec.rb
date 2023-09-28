# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::GetNext do
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign_user) { create(:campaign_user, user: user) }
  let!(:campaign) { campaign_user.campaign }
  let!(:assessment) { create(:assessment, category: Assessment::PSYCHOMETRIC) }
  let!(:assessment2) { create(:assessment, category: Assessment::PSYCHOMETRIC) }
  let!(:assessment3) { create(:assessment, category: Assessment::PSYCHOMETRIC) }
  let!(:group) { create(:campaign_assessment_group, campaign: campaign) }
  let!(:group2) { create(:campaign_assessment_group, campaign: campaign) }

  let!(:groups) do
    create(:campaign_assessment, campaign: campaign, assessment: assessment)
    create(:campaign_assessment, campaign: campaign, assessment: assessment2, campaign_assessment_group_id: group)
    create(:campaign_assessment, campaign: campaign, assessment: assessment3, campaign_assessment_group_id: group2)
  end

  it 'returns next assessment' do
    user_assessment = create(:user_assessment, subject: user, evaluator: user, assessment:
      assessment, campaign: campaign)
    user_assessment2 = create(:user_assessment, subject: user, evaluator: user, assessment:
      assessment2, campaign: campaign)

    next_assessment = described_class.call!(user_assessment)
    expect(next_assessment).to eq(user_assessment2)
  end

  it 'returns next assessment with groups' do
    user_assessment = create(:user_assessment, subject: user, evaluator: user, assessment: assessment,
      campaign: campaign)
    user_assessment2 = create(:user_assessment, subject: user, evaluator: user, assessment: assessment2,
      campaign: campaign)
    user_assessment3 = create(:user_assessment, subject: user, evaluator: user, assessment: assessment3,
      campaign: campaign)

    expect(described_class.call!(user_assessment2)).to eq(user_assessment)
    expect(described_class.call!(user_assessment)).to eq(user_assessment2)
    user_assessment.update(status: 'completed')
    expect(described_class.call!(user_assessment2)).to eq(user_assessment3)
    user_assessment3.update(status: 'completed')
    expect(described_class.call!(user_assessment2)).to eq(nil)
  end
end
