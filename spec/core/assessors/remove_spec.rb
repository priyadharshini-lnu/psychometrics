# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::Remove do
  let(:assessor) { create(:assessor) }
  let(:campaign) { assessor.campaign }

  it 'removes assessor' do
    described_class.call!(assessor)

    expect(Assessor.find_by(id: assessor.id)).to eq(nil)
  end

  it 'removes user_assessment from the campaign from where assessor is removed' do
    same_campaign_assessment = create(:user_assessment, campaign: campaign, evaluator_id: assessor.user_id)
    different_campaign_assessment = create(:user_assessment, campaign: create(:campaign),
      evaluator_id: assessor.user_id)

    described_class.call!(assessor)

    expect(UserAssessment.find_by(id: same_campaign_assessment.id)).to eq(nil)
    expect(UserAssessment.find_by(id: different_campaign_assessment.id)).to_not eq(nil)
  end
end
