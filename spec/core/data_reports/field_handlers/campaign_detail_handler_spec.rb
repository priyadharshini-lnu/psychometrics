# frozen_string_literal: true

require 'rails_helper'

describe DataReports::FieldHandlers::CampaignDetailHandler do
  let!(:campaign) { create(:campaign) }
  let!(:assessment) { create(:assessment) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:user_assessment) { create(:user_assessment, subject: user, assessment: assessment, status: :completed) }

  let!(:field) { { 'assessment_id' => assessment.id, 'field_name' => 'campaign_id' } }
  let!(:field2) { { 'assessment_id' => assessment.id, 'field_name' => 'campaign_name' } }
  let!(:field3) { { 'assessment_id' => assessment.id, 'field_name' => 'test' } }

  it '.call' do
    expect(described_class.call!(field, campaign_user: campaign_user)).to eq(campaign.id)
    expect(described_class.call!(field2, campaign_user: campaign_user)).to eq(campaign.name)
    expect(described_class.call!(field3, campaign_user: campaign_user)).to eq(nil)
  end
end
