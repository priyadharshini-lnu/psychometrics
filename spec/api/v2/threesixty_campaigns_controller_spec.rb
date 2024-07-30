# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ThreesixtyCampaignsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, client: client) }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }
  let!(:dimension) { create(:dimension, :with_factor) }
  let!(:assessment) { create(:assessment, category: 'threesixty', dimension_id: dimension.id) }
  let!(:campaign_template) { create(:campaign_template, assessment: assessment) }

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

      response '201', 'ThreesixtyCampaign Created' do
        schema '$ref' => '#/components/schemas/ThreesixtyCampaignSingleResponse'
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
          block = create(:block)
          block2 = create(:block)
          block3 = create(:block)
          question = create(:question, type: 'MatrixTable', assessment: assessment)
          question2 = create(:question, type: 'MatrixTable', assessment: assessment)
          question3 = create(:question, type: 'StaticContent', assessment: assessment)

          block.questions << question
          block2.questions << question2
          block2.questions << question3
          assessment.blocks << block
          assessment.blocks << block2
          assessment.blocks << block3
          question.factors_scorings.create(
            assessment: assessment,
            factor_id: dimension.factor_ids.first, question_id: question.id,
            props: [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2, 'value' => 3 }]
          )
          assessment.factors_scoring.create(factor_id: dimension.factor_ids.first, question_id: question2.id)

          {
            data: {
              type: 'threesixty_campaigns',
              attributes: {
                name: 'new campaign',
                threesixty_type: Threesixty::Campaign::STANDARD_360,
                campaign_template_id: '1',
                factors: assessment.dimension.factor_ids,
                questions: [
                  { id: question.id, selected_choice_indexes: [0, 2] }
                ]
              }
            }
          }
        end

        run_test! do |response|
          assessment_response = JSON.parse(response.body)['data']
          expect(assessment_response).to have_key('id')
          campaign = Threesixty::Campaign.find(assessment_response['id'])

          a = Assessment.find(campaign.assessment_id)
          expect(a.name).to eq('new campaign')
          expect(a.questions.size).to eq(2)
          expect(a.blocks.size).to eq(2)
          expect(a.questions.first.props['choices']).to eq(2)
          expect(a.questions.first.props['choicesTexts']).to eq(%w[1 3])
          expect(a.questions.first.factors_scorings.first.props).to eq([{ 'index' => 0, 'value' => 1 },
                                                                        { 'index' => 1, 'value' => 3 }])
          expect(a.blocks.first.questions.first.type).to eq('MatrixTable')
          expect(a.blocks.last.questions.last.type).to include('StaticContent')
        end
      end
    end
  end
end
