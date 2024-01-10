# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Campaigns::UsersController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessor) { create(:user, :assessor) }
  let!(:campaign) { create(:campaign) }
  let!(:campaign_assessor) { create(:assessor, user: assessor, campaign: campaign) }
  let(:user) { create(:user) }
  let(:user_id) { user.id }
  let(:campaign_id) { campaign.id }
  let(:lead_assessment) { create(:assessment, category: :lead_assessor_form) }
  let!(:campaign_factor_group) { create(:campaign_factor_group, campaign_id: campaign_id) }
  let(:campaign_factor_group_id) { campaign_factor_group.id.to_s }
  let!(:campaign_factor) do
    factor = create(
      :campaign_factor, name: 'Factor', campaign_factor_group_id: campaign_factor_group_id,
      campaign_id: campaign_id, factor_type: :assessor_scoring
    )
    factor.campaign_factor_values.create!(campaign_id: campaign_id, numeric_value: 3, user_id: user.id)
    factor
  end
  let!(:campaign_factor2) do
    create(
      :campaign_factor, name: 'Factor2', campaign_factor_group_id: campaign_factor_group_id,
      campaign_id: campaign_id, factor_type: :assessor_scoring
    )
  end
  let!(:campaign_assessments) do
    create(:campaign_assessor_assessment, campaign: campaign, assessment: lead_assessment)
    create(:campaign_assessment, campaign: campaign, assessment: lead_assessment)
  end
  let!(:assessors_user_assessment) do
    create(:user_assessment, evaluator: assessor, campaign: campaign, subject: user, assessment: lead_assessment,
           relationship: Relationship.assessor_relationship, status: :completed)
  end
  let(:factor_id) { campaign_factor.id.to_s }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(assessor) }

  path '/campaigns/{campaign_id}/users/{user_id}/assessors_scores' do
    get 'Assessor Scores List' do
      operationId 'CampaignFactors'
      description 'Fetch campaign Factor list'
      tags 'Campaign Factor Scoring'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string

      response '200', 'Campaign factor list' do
        schema '$ref' => '#/components/schemas/AssessorScoresResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'assessor_scores',
            attributes: {
              evaluator: {
                id: '1',
                first_name: 'John',
                last_name: 'Doe',
                email: 'johndoe@email.com'
              },
              assessment: {
                id: '1',
                name: 'Assessment 1'
              },
              scores: {
                '1': 3
              }
            }
          }]
        }

        run_test! do |response|
          cf = JSON.parse(response.body)['data'].first
          expect(cf).to have_attribute(:evaluator)
          expect(cf).to have_attribute(:assessment)
        end
      end
    end
  end
end
