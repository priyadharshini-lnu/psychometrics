# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:campaign) { create(:campaign) }
  let!(:superadmin) { create(:superadmin) }
  let!(:idp_template) { create(:idp_template) }
  let!(:include_resource_meta) { 'permissions' }

  before(:each) do
    sign_in(superadmin)
  end

  after(:each) do
    sign_out(superadmin)
  end

  path '/campaigns/{campaign_id}' do
    get 'Show Campaign' do
      operationId 'ShowCampaign'
      tags 'ShowCampaign'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :include_resource_meta, in: :query, required: true

      response '200', 'Campaign Found' do
        let(:campaign_id) { campaign.id }

        run_test! do |response|
          campaign_response = JSON.parse(response.body)['data']
          expect(campaign_response).to have_key('id')
          expect(campaign_response).to have_attribute(:name).with_value(campaign.name)
          expect(campaign_response).to have_attribute(:project_id).with_value(campaign.project_id)
          expect(campaign_response).to have_attribute(:type).with_value(campaign.type)
          expect(campaign_response).to have_attribute(:status).with_value(campaign.status)
          expect(campaign_response['meta']).to have_key('permissions')
        end
      end
    end
  end

  path '/campaigns/{campaign_id}' do
    patch 'Update Campaign' do
      operationId 'UpdateCampaign'
      tags 'UpdateCampaign'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignUpdateRequest' },
                required: true

      response '200', 'Campaign Updated' do
        let(:campaign_id) { campaign.id }

        let(:body) do
          {
            data: {
              type: 'campaigns',
              id: campaign_id.to_s,
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
            id: campaign_id.to_s
          }
        end
        run_test! do |response|
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
    end
  end

  path '/campaigns/{campaign_id}/all_assessments' do
    get 'Get All Campaign Assessments' do
      operationId 'GetAllCampaignAssessments'
      tags 'Campaigns'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'All assessments found' do
        let(:campaign_id) { campaign.id }

        let!(:regular_assessment) { create(:assessment) }
        let!(:assessor_form_assessment) { create(:assessment, category: :assessor_form) }
        let!(:lead_assessor_form_assessment) { create(:assessment, category: :lead_assessor_form) }
        let!(:user_only_assessment) { create(:assessment) }

        let!(:campaign_assessment) do
          create(:campaign_assessment, campaign: campaign, assessment: regular_assessment)
        end

        let!(:campaign_assessor_assessment) do
          create(:campaign_assessor_assessment,
                 campaign: campaign,
                 assessment: assessor_form_assessment,
                 campaign_assessment_group: create(:campaign_assessment_group, campaign: campaign))
        end

        let!(:lead_assessor_campaign_assessment) do
          create(:campaign_assessor_assessment,
                 campaign: campaign,
                 assessment: lead_assessor_form_assessment,
                 campaign_assessment_group: create(:campaign_assessment_group, campaign: campaign))
        end

        let!(:user_assessment_only) do
          create(:user_assessment,
                 campaign: campaign,
                 assessment: user_only_assessment,
                 subject: create(:user),
                 evaluator: create(:user))
        end

        run_test! do |response|
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
    end
  end
end
