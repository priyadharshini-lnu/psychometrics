# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignFactorValuesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessor) { create(:user, :assessor) }
  let!(:campaign) { create(:campaign) }
  let!(:campaign_assessor) { create(:assessor, user: assessor, campaign: campaign) }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:campaign_id) { campaign.id }
  let(:lead_assessment) { create(:assessment, category: :lead_assessor_form) }
  let!(:campaign_factor_group) { create(:campaign_factor_group, campaign_id: campaign_id) }
  let(:campaign_factor_group_id) { campaign_factor_group.id.to_s }
  let!(:campaign_factor) do
    factor = create(
      :campaign_factor, name: 'Factor', code: 'factor1', campaign_factor_group_id: campaign_factor_group_id,
      campaign_id: campaign_id, factor_type: :assessor_scoring
    )
    factor.campaign_factor_values.create!(campaign_id: campaign_id, numeric_value: 3, user_id: user.id)
    factor
  end
  let!(:campaign_factor2) do
    create(
      :campaign_factor, name: 'Factor2', code: 'factor2', campaign_factor_group_id: campaign_factor_group_id,
      campaign_id: campaign_id, factor_type: :assessor_scoring
    )
  end

  let!(:campaign_factor_with_formula) do
    create(:campaign_factor, campaign: campaign, output_type: :numeric,
            factor_type: :formula, code: 'factor3', formula: 'return __factor1 + __factor2')
  end

  let!(:campaign_assessments) do
    create(:campaign_assessor_assessment, campaign: campaign, assessment: lead_assessment)
    create(:campaign_assessment, campaign: campaign, assessment: lead_assessment)
  end
  let!(:assessors_user_assessment) do
    create(:user_assessment, evaluator: assessor, campaign: campaign, subject: user, assessment: lead_assessment,
           relationship: Relationship.assessor_relationship)
  end
  let(:factor_id) { campaign_factor.id.to_s }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(assessor) }

  path '/campaigns/{campaign_id}/campaign_factor_values' do
    get 'CampaignFactors List' do
      operationId 'CampaignFactors'
      description 'Fetch campaign Factor list'
      tags 'Campaign Factor Scoring'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :'filter[user_id_eq]', in: :query, required: true

      response '200', 'Campaign factor list' do
        schema '$ref' => '#/components/schemas/CampaignFactorValuesResponse'
        let(:'filter[user_id_eq]') { user.id }

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factor_values',
            attributes: {
              factor_id: 1,
              numeric_value: 3
            }
          }]
        }

        run_test! do |response|
          cf = JSON.parse(response.body)['data'].first
          expect(cf).to have_attribute(:numeric_value).with_value(3)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_factor_values/save_assessor_scoring_factor_value' do
    post 'Update CampaignFactorValue' do
      operationId 'UpdateCampaignFactorValue'
      description 'Update Campaign Factor Value'
      tags 'Campaign Factor Scoring'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :'filter[user_id_eq]', in: :query, required: true
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/CampaignFactorValueUpdateRequest' },
                required: true

      response '200', 'Update campaign factor' do
        let(:'filter[user_id_eq]') { user.id }

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_factor_values',
            attributes: {
              factor_id: 1,
              numeric_value: 3
            }
          }]
        }

        let(:body) do
          {
            data: {
              type: 'campaign_factor_values',
              attributes: {
                scores: [{
                  campaign_factor_id: campaign_factor.id,
                  score: 4
                }, {
                  campaign_factor_id: campaign_factor2.id,
                  score: 2
                }],
                user_id: user.id
              }
            }
          }
        end

        run_test! do |_|
          factor_value = campaign_factor.campaign_factor_values.find_by(user_id: user.id)
          factor_value2 = campaign_factor2.campaign_factor_values.find_by(user_id: user.id)
          calculated_factor = campaign_factor_with_formula.campaign_factor_values.find_by(user_id: user.id)

          expect(factor_value.numeric_value).to eq(4)
          expect(factor_value2).to be_present
          expect(factor_value2.numeric_value).to eq(2)

          expect(calculated_factor.numeric_value).to eq(6)
        end
      end
    end
  end
end
