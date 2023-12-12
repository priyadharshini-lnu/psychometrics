# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::GetLeadUserAssessment do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let!(:assessor) { create(:assessor) }
  let!(:user) do
    create(:user, project: project, email: 'user@gmail.com', first_name: 'Existed', last_name: 'User')
  end
  let!(:assessment) { create(:assessment, category: :lead_assessor_form) }
  let!(:campaign_assessor) { create(:campaign_assessor_assessment, campaign: campaign, assessment: assessment) }

  it 'should return lead assessor user assessment' do
    user_assessment = create(:user_assessment, campaign: campaign, subject: user, evaluator: assessor.user,
                        assessment: assessment)

    expect(described_class.call!(campaign, user)).to eq(user_assessment)
  end

  it 'should return nil for unexists assessmnet' do
    expect(described_class.call!(campaign, user)).to be_nil
  end
end
