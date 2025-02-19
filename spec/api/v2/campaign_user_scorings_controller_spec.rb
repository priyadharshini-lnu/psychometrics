# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::CampaignUserScoringsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:campaign) { create(:campaign) }
  let!(:campaign_admin) { create(:campaign_admin, campaign: campaign) }
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
  let!(:webhook) do
    create(:webhook, :with_topics, project_id: campaign.project_id, names: ['campaign_results_available'])
  end
  let(:factor_id) { campaign_factor.id.to_s }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(campaign_admin) }

  path '/campaigns/{campaign_id}/campaign_user_scorings' do
    let!(:campaign_factor) do
      factor = create(
        :campaign_factor, name: 'Factor', campaign_factor_group_id: campaign_factor_group_id,
        campaign_id: campaign_id, factor_type: :assessor_scoring
      )
      factor.campaign_factor_values.create!(campaign_id: campaign_id, numeric_value: 3, user_id: user.id)
      factor
    end
    get 'Get campaign user scorings' do
      operationId 'GetCampaignUserScorings'
      description 'Get campaign user scorings'
      tags 'CampaignUserScorings'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'CampaignUserScorings' do
        schema '$ref' => '#/components/schemas/CampaignUserListResponse'

        run_test! do |response|
          expect(response).to have_http_status(200)
          json_response = JSON.parse(response.body)

          expect(json_response['data']).not_to be_empty
          expect(json_response['data'].size).to eq(1)
          expect(json_response['meta']['record_count']).to eq(1)
          expect(json_response['meta']['page_count']).to eq(1)

          scoring = json_response['data'].first
          expect(scoring['id']).to eq(campaign_user.id.to_s)
          expect(scoring['attributes']['user']['id']).to eq(user.id.to_s)
          expect(scoring['attributes']['user']['email']).to eq(user.email)
          expect(scoring['attributes']['user']['first_name']).to eq(user.first_name)
          expect(scoring['attributes']['user']['last_name']).to eq(user.last_name)
          expect(scoring['attributes']['campaign_scores_finalized']).to eq(false)
          expect(scoring['attributes']['campaign_id']).to eq(campaign.id)
          expect(scoring['attributes']['campaign_factor_values'].
            first['campaign_factor_id'].to_i).to eq(campaign_factor.id)
          expect(scoring['attributes']['campaign_factor_values'].first['value']).to eq(3)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_user_scorings' do
    let!(:campaign_factor) do
      factor = create(
        :campaign_factor, name: 'Factor', campaign_factor_group_id: campaign_factor_group_id,
        campaign_id: campaign_id, factor_type: :assessor_scoring
      )
      factor.campaign_factor_values.create!(campaign_id: campaign_id, numeric_value: 3, user_id: user.id)
      factor
    end
    get 'Get campaign user scorings' do
      operationId 'GetCampaignUserScorings'
      description 'Get campaign user scorings'
      tags 'CampaignUserScorings'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'CampaignUserScorings' do
        schema '$ref' => '#/components/schemas/CampaignUserListResponse'

        run_test! do |response|
          expect(response).to have_http_status(200)
          json_response = JSON.parse(response.body)

          expect(json_response['data']).not_to be_empty
          expect(json_response['data'].size).to eq(1)
          expect(json_response['meta']['record_count']).to eq(1)
          expect(json_response['meta']['page_count']).to eq(1)

          scoring = json_response['data'].first
          expect(scoring['id']).to eq(campaign_user.id.to_s)
          expect(scoring['attributes']['user']['id']).to eq(user.id.to_s)
          expect(scoring['attributes']['user']['email']).to eq(user.email)
          expect(scoring['attributes']['user']['first_name']).to eq(user.first_name)
          expect(scoring['attributes']['user']['last_name']).to eq(user.last_name)
          expect(scoring['attributes']['campaign_scores_finalized']).to eq(false)
          expect(scoring['attributes']['campaign_id']).to eq(campaign.id)
          expect(scoring['attributes']['campaign_factor_values'].
            first['campaign_factor_id'].to_i).to eq(campaign_factor.id)
          expect(scoring['attributes']['campaign_factor_values'].first['value']).to eq(3)
        end
      end
    end
  end

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

      before do
        expect(CampaignFactorValue.where(campaign_id: campaign_id, user_id: user_id)).to be_empty
      end

      response '200', 'CampaignUserScorings' do
        run_test! do |response|
          expect(response.status).to eq(200)
          campaign_factor_value = CampaignFactorValue.find_by(campaign_id: campaign_id, user_id: user_id)
          expect(campaign_factor_value.value).to eq(4)
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
          expect(AdminJobRecord.last.data).to eq({ 'user_ids' => [user_id],
                                                   'excluded_user_ids' => nil,
                                                   'campaign_id' => campaign.id })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/campaign_user_scorings/import_external_campaign_scorings' do
    post 'Import external campaign scorings' do
      operationId 'ImportExternalCampaignScorings'
      description 'Import external campaign scorings for a campaign'
      tags 'CampaignUserScorings'
      consumes 'multipart/form-data'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :file, in: :formData, type: :file, description: 'CSV file containing campaign scorings'

      let(:file_path) { Rails.root.join('spec/fixtures/files/import_external_campaign_scoring/valid_file.csv') }
      let!(:campaign_id) { campaign.id }
      let!(:user) { create(:user, email: 'user@example.com', project: campaign.project) }
      let!(:campaign_factor) do
        create(:campaign_factor, factor_type: :external_score, code: 'ext_code1', campaign: campaign)
      end

      let!(:campaign_factor2) do
        create(:campaign_factor, factor_type: :external_score, code: 'ext_code2', campaign: campaign)
      end

      let(:file) { Rack::Test::UploadedFile.new(file_path, 'text/csv') }

      response '200', 'Campaign user scorings imported successfully' do
        run_test! do |_response|
          expect(AdminJobRecord.last.operation).to eq('import_external_campaign_scoring')
          expect(AdminJobRecord.last.data).to eq({ 'campaign_id' => campaign.id })
        end
      end
    end
  end
end
