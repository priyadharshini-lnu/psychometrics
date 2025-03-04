# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ThreesixtyCampaignsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, client: client) }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:dimension) { create(:dimension, :with_factor) }
  let!(:assessment) { create(:assessment, category: 'threesixty', dimension_id: dimension.id) }
  let!(:campaign_template) { create(:campaign_template, assessment: assessment) }

  let!(:question) { create(:question, type: 'MatrixTable', assessment: assessment) }

  before { sign_in(superadmin) }

  path '/projects/{project_id}/threesixty_campaigns/create_campaign' do
    post 'Create an threesixty campaign' do
      operationId 'CreateThreesixtyCampaign'
      description 'Create an threesixty campaign'
      description 'Create new ThreesixtyCampaign'
      tags 'ThreesixtyCampaigns'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string, required: true
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ThreesixtyCampaignRequest' },
                required: true

      response '200', 'ThreesixtyCampaign Created' do
        schema '$ref' => '#/components/schemas/OKResponse'
        examples 'application/json' => {
          data: {
            type: 'threesixty_campaigns',
            attributes: {
              name: 'name',
              threesixty_type: 'standard_360',
              campaign_template_id: '1',
              factors: [],
              questions: []
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'threesixty_campaigns',
              attributes: {
                name: 'new campaign',
                threesixty_type: Threesixty::Campaign::STANDARD_360,
                campaign_template_id: campaign_template.id.to_s,
                factors: assessment.dimension.factor_ids,
                questions: [
                  { id: question.id, selected_choice_indexes: [0, 2] }
                ]
              }
            }
          }
        end

        run_test! do |response|
          response = response.body
          expect(JSON.parse(response)).to eq('ok')
          expect(AdminJobRecord.last.operation).to eq('create_threesixty_campaign')
          expect(AdminJobRecord.last.data).to eq({
            'project_id' => project_id,
            'data' => { 'campaign_template_id' => campaign_template.id.to_s,
                        'factors' => assessment.dimension.factor_ids,
                        'name' => 'new campaign', 'threesixty_type' => 'standard_360',
                        'questions' => [{ 'id' => question.id, 'selected_choice_indexes' => [0, 2] }] }
          })
        end
      end
    end
  end
end
