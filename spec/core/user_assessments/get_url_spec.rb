# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::GetUrl do
  include Rails.application.routes.url_helpers
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign_user) { create(:campaign_user, user: user) }
  let(:campaign) { campaign_user.campaign }

  it 'returns agile_assessment_url' do
    assessment = create(:assessment, category: Assessment::AGILE)
    user_assessment = create(:user_assessment, evaluator: user, assessment: assessment, campaign: campaign)

    url = described_class.call!(user_assessment)
    expect(url).to eq(agile_user_assessment_path(user_assessment))
  end

  it 'returns saville_user_assessment_url' do
    assessment = create(:assessment, type: Assessment::TYPES[:saville], dimension: nil)
    user_assessment = create(:user_assessment, evaluator: user, assessment: assessment, campaign: campaign)

    url = described_class.call!(user_assessment)
    expect(url).to eq(pass_saville_user_assessment_path(user_assessment))
  end

  it 'returns hogan_user_assessment_url' do
    assessment = create(:assessment, type: Assessment::TYPES[:hogan], dimension: nil)
    user_assessment = create(:user_assessment, evaluator: user, assessment: assessment, campaign: campaign)

    url = described_class.call!(user_assessment)
    expect(url).to eq(pass_hogan_user_assessment_path(user_assessment))
  end

  it 'returns mettl_user_assessment_url' do
    assessment = create(:assessment, type: Assessment::TYPES[:mettl], dimension: nil)
    user_assessment = create(:user_assessment, evaluator: user, assessment: assessment, campaign: campaign)

    url = described_class.call!(user_assessment)
    expect(url).to eq(pass_mettl_user_assessment_path(user_assessment))
  end
end
