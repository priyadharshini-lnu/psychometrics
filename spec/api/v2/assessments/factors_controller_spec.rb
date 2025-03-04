# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Assessments::FactorsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, client: client) }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:dimension) { create(:dimension, :with_factor) }
  let!(:assessment) { create(:assessment, category: 'threesixty', dimension_id: dimension.id) }
  let!(:assessment_id) { assessment.id }
  let!(:campaign_template) { create(:campaign_template, assessment: assessment) }

  before { sign_in(superadmin) }

  path '/projects/{project_id}/assessments/{assessment_id}/factors' do
    get 'Fetch Factors' do
      operationId 'FetchFactors'
      description 'Fetch Factors'
      tags 'Factors'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string, required: true
      parameter name: :assessment_id, in: :path, type: :string, required: true

      response '200', 'Fetched Factors' do
        schema '$ref' => '#/components/schemas/FactorsMultipleResponse'
        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factors',
            attributes: {
              name: 'Factor',
              scoring_strategy: 'question'
            },
            relationships: {
              sub_factors: { data: { type: 'factors', id: 1 } }
            }
          }]
        }

        run_test! do |response|
          factor_response = JSON.parse(response.body)['data'].first
          expect(factor_response).to have_attribute(:name).with_value('factor 1')
          expect(factor_response['type']).to eq('factors')
        end
      end
    end
  end
end
