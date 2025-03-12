# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignAssessmentsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:workshop) { create(:workshop, :with_managers, :with_assessors, campaign_id: campaign_id) }
  let!(:workshop_id) { workshop.id }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/workshops/{workshop_id}/campaign_assessments' do
    get 'CampaignAssessments List' do
      operationId 'CampaignAssessmentsList'
      description 'Fetch campaign Assessments list'
      tags 'Campaign Scheduling'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :workshop_id, in: :path, type: :string

      response '200', 'Workshops list' do
        schema '$ref' => '#/components/schemas/CampaignAssessmentsListResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_assessments',
            links: {
              self: 'http://www.example.com/api/v2/administration/workshops/1/campaign_assessments'
            },
            attributes: {
              campaign_id: 1
            },
            relationships: {
              assessment: {
                data: {
                  type: 'assessments',
                  id: '2'
                }
              }
            }
          }]
        }

        run_test! do |response|
          workshop_response = JSON.parse(response.body)['data'].first
          expect(workshop_response).to have_attribute(:campaign_id).with_value(campaign.id)
          expect(workshop_response).to have_relationship(:assessment)
        end
      end
    end
  end
end
