# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::GetLeadUserAssessmentsForAssessor do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let!(:assessor) { create(:assessor) }
  let!(:user) do
    create(:user, project: project, email: 'user@gmail.com', first_name: 'Existed', last_name: 'User')
  end
  let!(:assessment) { create(:assessment, category: :lead_assessor_form) }

  it 'should return lead assessor user assessments' do
    create(:campaign_assessor_assessment, campaign: campaign, assessment: assessment)
    user_assessment = create(:user_assessment, campaign: campaign, subject: user, evaluator: assessor.user,
      assessment: assessment)

    expect(described_class.call!(campaign, assessor)).to eq([user_assessment])
  end

  it 'should return nil for unexists lead assessmnet' do
    expect(described_class.call!(campaign, assessor)).to be_empty
  end
end
