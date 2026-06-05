# frozen_string_literal: true

require 'rails_helper'
require_relative 'concerns/taggable_api_endpoints_shared_examples'

RSpec.describe Api::V2::Administration::CampaignsController, type: :request do
  let!(:campaign) { create(:campaign) }
  let!(:superadmin) { create(:superadmin) }
  let!(:api_key) { create(:api_key, user: superadmin) }
  let!(:idp_template) { create(:idp_template) }
  let!(:include_resource_meta) { 'permissions' }
  let(:authorization) { "Basic #{Base64.strict_encode64("#{api_key.key}:#{api_key.token}")}" }

  before(:each) do
    sign_in(superadmin)
  end

  after(:each) do
    sign_out(superadmin)
  end

  describe 'GET /api/v2/administration/campaigns/{campaign_id}' do
    it 'Show Campaign' do
      get "/api/v2/administration/campaigns/#{campaign.id}",
          params: { include_resource_meta: include_resource_meta },
          headers: { 'Authorization' => authorization, 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      campaign_response = JSON.parse(response.body)['data']
      expect(campaign_response).to have_key('id')
      expect(campaign_response).to have_attribute(:name).with_value(campaign.name)
      expect(campaign_response).to have_attribute(:project_id).with_value(campaign.project_id)
      expect(campaign_response).to have_attribute(:type).with_value(campaign.type)
      expect(campaign_response).to have_attribute(:status).with_value(campaign.status)
      expect(campaign_response['meta']).to have_key('permissions')
    end
  end

  describe 'PATCH /api/v2/administration/campaigns/{campaign_id}' do
    it 'Update Campaign' do
      body = {
        data: {
          type: 'campaigns',
          id: campaign.id.to_s,
          attributes: {},
          relationships: {
            default_idp_template: {
              data: {
                type: 'idp_templates',
                id: idp_template.id.to_s
              }
            }
          }
        },
        id: campaign.id.to_s
      }

      patch "/api/v2/administration/campaigns/#{campaign.id}",
            params: body.to_json,
            headers: { 'Authorization' => authorization, 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      campaign_response = JSON.parse(response.body)['data']
      expect(campaign_response).to have_key('id')
      expect(campaign_response).to have_attribute(:name).with_value(campaign.name)
      expect(campaign_response).to have_attribute(:project_id).with_value(campaign.project_id)
      expect(campaign_response).to have_attribute(:type).with_value(campaign.type)
      expect(campaign_response).to have_attribute(:status).with_value(campaign.status)
      expect(campaign_response).to have_relationship(:default_idp_template).
        with_data({ 'id' => idp_template.id.to_s, 'type' => 'idp_templates' })
    end
  end

  describe 'GET /api/v2/administration/campaigns/{campaign_id}/all_assessments' do
    it 'Get All Campaign Assessments' do
      regular_assessment = create(:assessment)
      assessor_form_assessment = create(:assessment, category: :assessor_form)
      lead_assessor_form_assessment = create(:assessment, category: :lead_assessor_form)
      user_only_assessment = create(:assessment)

      create(:campaign_assessment, campaign: campaign, assessment: regular_assessment)

      create(:campaign_assessor_assessment,
             campaign: campaign,
             assessment: assessor_form_assessment,
             campaign_assessment_group: create(:campaign_assessment_group, campaign: campaign))

      create(:campaign_assessor_assessment,
             campaign: campaign,
             assessment: lead_assessor_form_assessment,
             campaign_assessment_group: create(:campaign_assessment_group, campaign: campaign))

      create(:user_assessment,
             campaign: campaign,
             assessment: user_only_assessment,
             subject: create(:user),
             evaluator: create(:user))

      get "/api/v2/administration/campaigns/#{campaign.id}/all_assessments",
          headers: { 'Authorization' => authorization, 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      assessments_response = JSON.parse(response.body)['data']
      assessment_ids = assessments_response.map { |a| a['id'].to_i }

      expect(assessment_ids).to contain_exactly(
        regular_assessment.id,
        assessor_form_assessment.id,
        lead_assessor_form_assessment.id,
        user_only_assessment.id
      )

      assessments_response.each do |assessment|
        expect(assessment).to have_key('id')
        expect(assessment).to have_key('type')
        expect(assessment['type']).to eq('assessments')
        expect(assessment).to have_key('attributes')
        expect(assessment['attributes']).to have_key('name')
      end
    end
  end

  describe 'taggable API endpoints' do
    include_examples 'taggable API endpoints', Campaign
  end
end
