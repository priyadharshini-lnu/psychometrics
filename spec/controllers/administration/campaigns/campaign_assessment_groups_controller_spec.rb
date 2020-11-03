# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::CampaignAssessmentGroupsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign, name: 'Group') }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it 'index' do
    campaign.campaign_assessments.create(assessment: build(:assessment))
    campaign_assessment_group.campaign_assessments.create(campaign: campaign, assessment: build(:assessment))
    campaign_assessment_group.campaign_assessments.create(campaign: campaign, assessment: build(:assessment))

    get :index, params: {
      new_campaign_id: campaign.id
    }

    parsed_response = JSON.parse(response.body)

    expect(parsed_response['groups'].first['name']).to eq 'Group'
    expect(parsed_response['assessments'].length).to eq 3
    expect(parsed_response['assessments'].find { |a| a['position'] == 1 }['campaign_assessment_group_id']).to be_nil
    expect(parsed_response['assessments'].count { |a| a['campaign_assessment_group_id'] == 1 }).to eq 2
  end

  it 'create' do
    put :create, params: {
      new_campaign_id: campaign.id,
      resource: { name: 'Group1', previous_assessments_required: true, previous_group_required: true }
    }

    parsed_response = JSON.parse(response.body)

    expect(parsed_response['name']).to eq 'Group1'
    expect(parsed_response['campaign_id']).to eq campaign.id
    expect(parsed_response['previous_assessments_required']).to eq true
    expect(parsed_response['previous_group_required']).to eq true
  end

  it 'update' do
    put :update, params: {
      id: campaign_assessment_group.id,
      new_campaign_id: campaign.id,
      resource: { name: 'Group2', position: 4 }
    }

    parsed_response = JSON.parse(response.body)

    expect(parsed_response['name']).to eq 'Group2'
    expect(parsed_response['position']).to eq 4
  end

  it 'destroy' do
    campaign.campaign_assessments.create(position: 1)
    ca1 = campaign_assessment_group.campaign_assessments.create(campaign_id: campaign.id)
    ca2 = campaign_assessment_group.campaign_assessments.create(campaign_id: campaign.id)
    put :destroy, params: {
      id: campaign_assessment_group.id,
      new_campaign_id: campaign.id
    }

    expect([ca1.reload.position, ca2.reload.position]).to match_array([2, 3])
  end
end
