# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignUserScoringsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let(:user) { create(:user) }
  let(:user_id) { user.id }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_factor_group) { create(:campaign_factor_group, campaign_id: campaign_id) }
  let(:campaign_factor_group_id) { campaign_factor_group.id.to_s }
  let!(:campaign_factor) do
    create(
      :campaign_factor, name: 'Factor', campaign_factor_group_id: campaign_factor_group_id,
      campaign_id: campaign_id, formula: 'return 4'
    )
  end
  let(:factor_id) { campaign_factor.id.to_s }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/campaign_user_scorings/{user_id}/change_finalized_campaign_score' do
    post 'Change campaign user finalized' do
      operationId 'CampaignUserScorings'
      description 'Change campaign user finalized'
      tags 'CampaignUserScorings'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :body, in: :body, schema:
                { '$ref' => '#/components/schemas/CampaignUserScoringsChangeFinalizeRequest' }, required: true

      let(:body) do
        {
          data: {
            type: 'campaign_users',
            attributes: {
              finalized: true
            }
          }
        }
      end

      response '200', 'CampaignUserScorings' do
        schema '$ref' => '#/components/schemas/CampaignUserResponse'

        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'campaign_users',
            attributes: {
              campaign_scores_finalized: true,
              campaign_scores_finalized_date: '2020-01-01T00:00:00.000Z',
              campaign_scores_calculated_date: '2020-01-01T00:00:00.000Z'
            }
          }]
        }

        run_test! do |response|
          cf = JSON.parse(response.body)['data']
          expect(cf).to have_attribute(:campaign_scores_finalized).with_value(true)
          expect(campaign_user.reload.campaign_scores_finalized).to eq(true)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_user_scorings/change_finalized_campaign_score_bulk' do
    post 'Rescore campaign user finalized' do
      operationId 'RescoreCampaignUserScorings'
      description 'Rescore campaign user scoring'
      tags 'CampaignUserScorings'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :body, in: :body, schema:
                { '$ref' => '#/components/schemas/CampaignUserScoringsChangeFinalizeBulkRequest' }, required: true
      let(:body) do
        {
          data: {
            type: 'campaign_users',
            attributes: {
              user_ids: [user_id],
              finalized: true
            }
          }
        }
      end

      response '200', 'CampaignUserScorings' do
        schema '$ref' => '#/components/schemas/OKResponse'

        run_test! do |response|
          expect(response.status).to eq(200)
          expect(campaign_user.reload.campaign_scores_finalized).to eq(true)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_user_scorings/{user_id}/rescore' do
    post 'Rescore campaign user finalized' do
      operationId 'RescoreCampaignUserScorings'
      description 'Rescore campaign user scoring'
      tags 'CampaignUserScorings'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string

      before { expect(campaign_user.campaign_factor_values).to be_empty }

      response '200', 'CampaignUserScorings' do
        run_test! do |response|
          expect(response.status).to eq(200)

          expect(campaign_user.campaign_factor_values.first.numeric_value).to eq(4)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_user_scorings/rescore_bulk' do
    post 'Rescore campaign user finalized' do
      operationId 'RescoreCampaignUserScorings'
      description 'Rescore campaign user scoring'
      tags 'CampaignUserScorings'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string
      parameter name: :body, in: :body, schema:
                { '$ref' => '#/components/schemas/CampaignUserScoringsRescoreBulkRequest' }, required: true

      let(:body) do
        {
          data: {
            type: 'campaign_users',
            attributes: {
              user_ids: [user_id]
            }
          }
        }
      end

      response '200', 'CampaignUserScorings' do
        run_test! do |_response|
          expect(AdminJobRecord.last.operation).to eq('bulk_rescore_campaign_factors')
          expect(AdminJobRecord.last.data).to eq({ 'user_ids' => [user_id], 'campaign_id' => campaign.id })
        end
      end
    end
  end
end
