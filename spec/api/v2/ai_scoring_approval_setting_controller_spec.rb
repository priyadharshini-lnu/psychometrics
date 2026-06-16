# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::AIScoringApprovalSettingsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let!(:campaign_id) { campaign.id }

  before { sign_in(superadmin) }

  describe 'GET /campaigns/:campaign_id/ai_scoring_approval_settings' do
    it 'fetches AI Scoring Approval Setting List' do
      admins = create_list(:client_admin, 4)
      ai_scoring_approval_setting = create(
        :ai_scoring_approval_setting, assessor_ids: [admins[0].id], approver_ids: [admins[1].id],
        campaign_id: campaign_id
      )

      get "/api/v2/administration/campaigns/#{campaign_id}/ai_scoring_approval_settings",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      data = JSON.parse(response.body)['data']
      ai_scoring_approval_settings_response = data.find { |d| d['id'] == ai_scoring_approval_setting.id.to_s }
      expect(ai_scoring_approval_settings_response).to have_key('id')
      expect(ai_scoring_approval_settings_response).to have_attribute(:assessors).with_value([
        { 'id' => admins[0].id.to_s, 'email' => admins[0].email, 'name' => admins[0].name }
      ])
      expect(ai_scoring_approval_settings_response).to have_attribute(:approvers).with_value([
        { 'id' => admins[1].id.to_s, 'email' => admins[1].email, 'name' => admins[1].name }
      ])
      expect(ai_scoring_approval_settings_response).to have_relationship(:campaign).
        with_data({ 'id' => ai_scoring_approval_setting.campaign_id.to_s, 'type' => 'campaigns' })
      expect(ai_scoring_approval_settings_response).to have_relationship(:assessment).
        with_data({ 'id' => ai_scoring_approval_setting.assessment_id.to_s, 'type' => 'assessments' })
    end
  end

  describe 'POST /campaigns/:campaign_id/ai_scoring_approval_settings' do
    it 'creates a ai_scoring_approval_settings' do
      assessment = create(:assessment)
      admins = create_list(:client_admin, 4)
      admins.each do |admin|
        create(:membership, user_id: admin.id, client_id: campaign.client.id, role: :client_admin)
      end

      body = jsonapi_resource_request(
        'ai_scoring_approval_settings',
        {
          assessor_ids: [admins[0].id], approver_ids: [admins[1].id],
          allow_bulk_approve: false,
          allow_bulk_approve_scores: false
        },
        {
          assessment: { id: assessment.id.to_s, type: 'assessments' }
        }
      )

      post "/api/v2/administration/campaigns/#{campaign_id}/ai_scoring_approval_settings",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:assessors).with_value([
        { 'id' => admins[0].id.to_s, 'email' => admins[0].email, 'name' => admins[0].name }
      ])
      expect(data).to have_attribute(:approvers).with_value([
        { 'id' => admins[1].id.to_s, 'email' => admins[1].email, 'name' => admins[1].name }
      ])
      expect(data).to have_relationship(:campaign).
        with_data({ 'id' => campaign.id.to_s, 'type' => 'campaigns' })
      expect(data).to have_relationship(:assessment).
        with_data({ 'id' => assessment.id.to_s, 'type' => 'assessments' })
    end
  end

  describe 'PATCH /campaigns/:campaign_id/ai_scoring_approval_settings/:ai_scoring_approval_setting_id' do
    it 'updates a ai_scoring_approval_settings' do
      campaign = create(:campaign)
      assessment = create(:assessment)
      admin = create(:client_admin)
      create(:membership, user_id: admin.id, client_id: campaign.client.id, role: :client_admin)
      ai_scoring_approval_setting = create(:ai_scoring_approval_setting, campaign: campaign, assessment: assessment)

      body = jsonapi_resource_request(
        'ai_scoring_approval_settings',
        { id: ai_scoring_approval_setting.id.to_s, assessor_ids: [admin.id] },
        {
          assessment: { id: assessment.id.to_s, type: 'assessments' }
        }
      )

      patch "/api/v2/administration/campaigns/#{campaign.id}/ai_scoring_approval_settings/#{ai_scoring_approval_setting.id}", # rubocop:disable Layout/LineLength
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:assessors).with_value([
        { 'id' => admin.id.to_s, 'email' => admin.email, 'name' => admin.name }
      ])
      expect(data).to have_relationship(:assessment).
        with_data({ 'id' => assessment.id.to_s, 'type' => 'assessments' })
    end
  end

  describe 'DELETE /campaigns/:campaign_id/ai_scoring_approval_settings/:ai_scoring_approval_setting_id' do
    it 'deletes a ai_scoring_approval_setting' do
      campaign = create(:campaign)
      ai_scoring_approval_setting = create(:ai_scoring_approval_setting, campaign: campaign)

      delete "/api/v2/administration/campaigns/#{campaign.id}/ai_scoring_approval_settings/#{ai_scoring_approval_setting.id}", # rubocop:disable Layout/LineLength
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response.body).to be_empty
      expect(AI::ScoringApprovalSetting.find_by(id: ai_scoring_approval_setting.id)).to eq(nil)
    end
  end
end
