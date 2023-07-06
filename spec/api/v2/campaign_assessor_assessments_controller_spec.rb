# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignAssessorAssessmentsController, swagger_doc: 'v2/swagger.json',
  type: :request do
  let!(:campaign_assessor_assessment) { create(:campaign_assessor_assessment) }
  let!(:campaign_id) { campaign_assessor_assessment.campaign_id }
  let!(:assessment_id) { campaign_assessor_assessment.assessment_id.to_s }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/campaign_assessor_assessments/' do
    get 'Campaign Assessor Assessment List' do
      operationId 'CampaignAssessorAssessmentList'
      description 'Fetch Campaigns Assessor Assessments list'

      tags 'Campaign Assessor Assessment'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Campaigns Assessor Assessment list' do
        schema '$ref' => '#/components/schemas/CampaignAssessorAssessmentListResponse'

        examples 'application/json' => [{
          type: 'campaign_assessor_assessments',
          data: {
            id: '1',
            attributes: {
              campaign_id: '1',
              assessment_id: '1'
            }
          }
        }]

        run_test! do |response|
          campaign_assessor_assessments = JSON.parse(response.body)
          campaign_assessor_assessments_response = campaign_assessor_assessments['data'].find do |c|
            c['id'] == campaign_assessor_assessment.id.to_s
          end
          expect(campaign_assessor_assessments_response).to have_key('id')
          expect(campaign_assessor_assessments_response).to have_attribute(:assessment_id).with_value(assessment_id)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_assessor_assessments/' do
    post 'Create a Campaign Assessor Assessment' do
      operationId 'CreateCampaignAssessorAssessment'
      description 'Create new Campaign Assessor Assessment'
      tags 'Campaign Assessor Assessment'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/CampaignAssessorAssessmentCreateRequest' },
                required: true

      response '201', 'Assessor Assessment Created' do
        schema '$ref' => '#/components/schemas/CampaignAssessmentAssessorResponse'
        examples 'application/json' => [{
          data: {
            type: 'campaign_assessor_assessments',
            attributes: {
              assessment_id: '1',
              campaign_id: '1'
            }
          }
        }]

        let(:assessment) { create(:assessment) }
        let(:campaign) { create(:campaign) }
        let(:body) do
          jsonapi_resource_request(
            'campaign_assessor_assessments',
            { assessment_id: assessment.id.to_s }
          )
        end

        run_test! do |response|
          assessor_assessment_response = JSON.parse(response.body)['data']
          expect(assessor_assessment_response).to have_key('id')
          expect(assessor_assessment_response).to have_attribute(:assessment_id).with_value(assessment.id.to_s)
        end
      end
    end
  end
end
