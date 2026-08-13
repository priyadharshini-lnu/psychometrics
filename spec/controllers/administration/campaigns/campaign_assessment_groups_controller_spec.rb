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

    parsed_response = response.parsed_body

    expect(parsed_response['groups'].first['name']).to eq 'Group'
    expect(parsed_response['assessments'].length).to eq 3
    expect(parsed_response['assessments'].find { |a| a['position'] == 1 }['campaign_assessment_group_id']).to be_nil
    expect(parsed_response['assessments'].count do |a|
      a['campaign_assessment_group_id'] == campaign_assessment_group.id
    end).to eq 2
  end

  it 'create' do
    put :create, params: {
      new_campaign_id: campaign.id,
      resource: { name: 'Group1', previous_assessments_required: true, previous_group_required: true }
    }

    parsed_response = response.parsed_body

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

    parsed_response = response.parsed_body

    expect(parsed_response['name']).to eq 'Group2'
    expect(parsed_response['position']).to eq 4
  end

  it 'update localized name for selected locale' do
    put :update, params: {
      id: campaign_assessment_group.id,
      new_campaign_id: campaign.id,
      locale: 'ar',
      resource: { name: 'Arabic Group Name' }
    }

    expect(response).to have_http_status(:success)

    Mobility.with_locale('ar') do
      expect(campaign_assessment_group.reload.name).to eq('Arabic Group Name')
    end
  end

  it 'fetch_name_translations for requested locales' do
    Mobility.with_locale('en') { campaign_assessment_group.update!(name: 'Group EN') }
    Mobility.with_locale('ar') { campaign_assessment_group.update!(name: 'Group AR') }

    get :fetch_name_translations, params: {
      id: campaign_assessment_group.id,
      new_campaign_id: campaign.id,
      locales: %w[en ar]
    }

    expect(response).to have_http_status(:success)
    parsed_body = response.parsed_body
    expect(parsed_body['list']).to eq(
      [
        { 'name' => 'Group EN', 'locale' => 'en' },
        { 'name' => 'Group AR', 'locale' => 'ar' }
      ]
    )
    expect(parsed_body['available_locales']).to match_array(%w[en ar])
  end

  it 'update_positions' do
    group1 = create(:campaign_assessment_group, campaign: campaign, name: 'Group')
    group2 = create(:campaign_assessment_group, campaign: campaign, name: 'Group')

    post :update_positions, params: {
      campaign_assessment_groups: [
        {
          id: group1.id,
          position: 3
        },
        {
          id: group2.id,
          position: 6
        }

      ],
      new_campaign_id: campaign.id
    }
    expect(response).to have_http_status(:success)
    expect(group1.reload.position).to eq 3
    expect(group2.reload.position).to eq 6
  end

  it 'will not update_positions for other campaign' do
    other_campaign = create(:campaign)

    group = create(:campaign_assessment_group, campaign: campaign, name: 'Group')

    post :update_positions, params: {
      campaign_assessment_groups: [
        {
          id: group.id,
          position: 3
        }
      ],
      new_campaign_id: other_campaign.id
    }
    expect(response).to have_http_status(400)
    expect(group.reload.position).to eq 1
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
