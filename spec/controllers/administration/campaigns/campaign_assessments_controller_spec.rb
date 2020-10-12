# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::CampaignAssessmentsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:report_family) { report.report_families.first }
  let(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign, name: 'Group') }
  let(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, position: 1) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it 'update' do
    put :update, params: {
      id: campaign_assessment.id,
      new_campaign_id: campaign.id,
      resource: { campaign_assessment_group_id: campaign_assessment_group.id, position: 4 }
    }

    parsed_response = JSON.parse(response.body)

    expect(parsed_response['campaign_assessment_group_id']).to eq campaign_assessment_group.id
    expect(parsed_response['position']).to eq 4
  end

  it 'attach_to_group' do
    ca1 = campaign_assessment_group.campaign_assessments.create(campaign_id: campaign.id, position: 5)
    ca2 = campaign_assessment_group.campaign_assessments.create(campaign_id: campaign.id, position: 4)
    post :attach_to_group, params: {
      id: campaign_assessment.id,
      new_campaign_id: campaign.id,
      group_id: campaign_assessment_group.id,
      position: 2
    }
    expect(ca1.reload.position).to eq 1
    expect(ca2.reload.position).to eq 3
    expect(campaign_assessment.reload.position).to eq 2
    expect(campaign_assessment.reload.campaign_assessment_group_id).to eq campaign_assessment_group.id
  end
end
