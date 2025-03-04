# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignScoringVariablesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:campaign_options) { campaign.campaign_options }
  let(:campaign_option_id) { campaign_options.id.to_s }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before do
    campaign_options.update(campaign_scoring_variables: 'test = 1')
    sign_in(superadmin)
  end

  path '/campaigns/{campaign_id}/campaign_scoring_variables' do
    get 'CampaignScoringVariables List' do
      operationId 'CampaignScoringVariables'
      description 'Fetch campaign scoring variables'
      tags 'CampaignScoringVariables'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'Campaign scoring variables' do
        schema '$ref' => '#/components/schemas/CampaignScoringVariableResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_scoring_variables',
            attributes: {
              variables: 'test = 1'
            }
          }]
        }

        run_test! do |response|
          cfg = JSON.parse(response.body)['data'].first
          expect(cfg).to have_attribute(:variables).with_value('test = 1')
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_scoring_variables/{campaign_option_id}' do
    patch 'Update CampaignScoringVariables' do
      operationId 'UpdateCampaignScoringVariabless'
      description 'Update campaign scoring values'
      tags 'CampaignScoringVariables'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :campaign_option_id, in: :path, type: :string
      parameter name: :body, in: :body, schema:
        { '$ref' => '#/components/schemas/CampaignScoringVariableUpdateRequest' }, required: true

      response '200', 'Update campaign scoring variables' do
        schema '$ref' => '#/components/schemas/CampaignScoringVariableSingleResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_scoring_variables',
            attributes: {
              variables: 'test = 1'
            }
          }]
        }

        let(:body) do
          {
            data: {
              type: 'campaign_scoring_variables',
              id: campaign_option_id,
              attributes: {
                variables: 'test = 2'
              }
            }
          }
        end

        run_test! do |response|
          cfg = JSON.parse(response.body)['data']
          expect(cfg).to have_key('id')
          expect(cfg).to have_attribute(:variables).with_value('test = 2')
        end
      end

      response '422', 'invalid request' do
        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_scoring_variables',
            attributes: {
              variables: 'test = 1'
            }
          }]
        }

        let(:body) do
          {
            data: {
              type: 'campaign_scoring_variables',
              id: campaign_option_id,
              attributes: {
                variables: "test = 2\ntest2 = afd3"
              }
            }
          }
        end

        run_test! do |response|
          errors = JSON.parse(response.body)['errors']
          expect(errors.first['title']).to eq("invalid statement 'test2 = afd3' on line number 2")
        end
      end
    end
  end
end
