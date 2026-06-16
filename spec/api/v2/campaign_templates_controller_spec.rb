# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Api::V2::Administration::CampaignTemplatesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:owner) { create(:tenancy) }
  let!(:assessment) { create(:assessment, :with_same_owner_dimension, owner:, created_by: superadmin) }
  let(:report) { create(:report, assessments: [assessment], owner:, created_by: superadmin) }
  let!(:campaign_template) { create(:campaign_template, assessment: assessment, report: report, owner: owner) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/campaign_templates' do
    it 'returns campaign templates list' do
      get '/api/v2/administration/campaign_templates'

      expect(response).to have_http_status(:ok)
      campaign_templates = JSON.parse(response.body)
      campaign_templates_response = campaign_templates['data'].find { |c| c['id'] == campaign_template.id.to_s }
      expect(campaign_templates_response).to have_key('id')
      expect(campaign_templates_response).to have_attribute(:name).with_value(campaign_template.name)
      expect(campaign_templates_response).to have_relationship(:assessment).
        with_data({ 'id' => campaign_template.assessment.id.to_s, 'type' => 'assessments' })
    end
  end

  describe 'POST /api/v2/administration/campaign_templates' do
    it 'creates a campaign template' do
      owner_new = create(:tenancy, name: 'New Client')
      assessment_new = create(:assessment, :with_same_owner_dimension, name: 'New Assessmen', owner: owner_new,
        skip_owner_validation: true)
      report_new = create(:report, assessments: [assessment], name: 'New Report', owner: owner_new,
skip_owner_validation: true)

      body = {
        data: {
          type: 'campaign_templates',
          attributes: {
            name: 'New Name'
          },
          relationships: {
            owner: {
              data: {
                type: 'clients',
                id: owner_new.id.to_s
              }
            },
            report: {
              data: {
                type: 'reports',
                id: report_new.id.to_s
              }
            },
            assessment: {
              data: {
                type: 'assessments',
                id: assessment_new.id.to_s
              }
            }
          }
        }
      }

      post '/api/v2/administration/campaign_templates', params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      campaign_template_resp = JSON.parse(response.body)['data']
      expect(campaign_template_resp).to have_key('id')
      expect(campaign_template_resp).to have_attribute(:name).with_value('New Name')
      expect(campaign_template_resp).to have_relationship(:assessment).
        with_data({ 'id' => assessment_new.id.to_s, 'type' => 'assessments' })
      expect(campaign_template_resp).to have_relationship(:owner).
        with_data({ 'id' => owner_new.id.to_s, 'type' => 'clients' })
      expect(campaign_template_resp).to have_relationship(:report).
        with_data({ 'id' => report_new.id.to_s, 'type' => 'reports' })
    end
  end

  describe 'PATCH /api/v2/administration/campaign_templates/:campaign_template_id' do
    it 'updates a campaign template' do
      owner_new = create(:tenancy, name: 'New Client')
      assessment_new = create(:assessment, :with_same_owner_dimension, name: 'New Assessmen', owner: owner_new,
        skip_owner_validation: true)
      report_new = create(:report, assessments: [assessment], name: 'New Report', owner: owner_new,
skip_owner_validation: true)
      template_to_update = create(:campaign_template, name: 'Old Name', assessment: assessment, report: report,
owner: owner)

      body = {
        data: {
          type: 'campaign_templates',
          id: template_to_update.id.to_s,
          attributes: {
            name: 'New Name'
          },
          relationships: {
            owner: {
              data: {
                type: 'clients',
                id: owner_new.id.to_s
              }
            },
            report: {
              data: {
                type: 'reports',
                id: report_new.id.to_s
              }
            },
            assessment: {
              data: {
                type: 'assessments',
                id: assessment_new.id.to_s
              }
            }
          }
        }
      }

      patch "/api/v2/administration/campaign_templates/#{template_to_update.id}", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      campaign_template_resp = JSON.parse(response.body)['data']
      expect(campaign_template_resp).to have_key('id')
      expect(campaign_template_resp).to have_attribute(:name).with_value('New Name')
      expect(campaign_template_resp).to have_relationship(:assessment).
        with_data({ 'id' => assessment_new.id.to_s, 'type' => 'assessments' })
      expect(campaign_template_resp).to have_relationship(:owner).
        with_data({ 'id' => owner_new.id.to_s, 'type' => 'clients' })
      expect(campaign_template_resp).to have_relationship(:report).
        with_data({ 'id' => report_new.id.to_s, 'type' => 'reports' })
    end

    it 'deletes a campaign template' do
      template_to_delete = create(:campaign_template, assessment: assessment, report: report, owner: owner)

      delete "/api/v2/administration/campaign_templates/#{template_to_delete.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect(response.body).to be_empty
      expect(CampaignTemplate.find_by(id: template_to_delete.id)).to eq(nil)
    end
  end
end
