# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CampaignUserScoringsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
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

  before { sign_in(campaign_admin) }

  describe 'GET /campaigns/:campaign_id/campaign_user_scorings' do
    let!(:assessor_scoring_factor) do
      factor = create(
        :campaign_factor, name: 'Factor', campaign_factor_group_id: campaign_factor_group_id,
        campaign_id: campaign_id, factor_type: :assessor_scoring
      )
      factor.campaign_factor_values.create!(campaign_id: campaign_id, numeric_value: 3, user_id: user.id)
      factor
    end

    it 'returns campaign user scorings' do
      get "/api/v2/administration/campaigns/#{campaign_id}/campaign_user_scorings",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(200)
      json_response = JSON.parse(response.body)

      expect(json_response['data']).not_to be_empty

      scoring = json_response['data'].first
      expect(scoring['id']).to eq(campaign_user.id.to_s)
      expect(scoring['attributes']['user']['id']).to eq(user.id.to_s)
      expect(scoring['attributes']['user']['email']).to eq(user.email)
      expect(scoring['attributes']['user']['first_name']).to eq(user.first_name)
      expect(scoring['attributes']['user']['last_name']).to eq(user.last_name)
      expect(scoring['attributes']['campaign_scores_finalized']).to eq(false)
      expect(scoring['attributes']['campaign_id']).to eq(campaign.id)
      expect(scoring['attributes']['campaign_factor_values']).not_to be_empty
    end
  end

  describe 'POST /campaigns/:campaign_id/campaign_user_scorings/:user_id/change_finalized_campaign_score' do
    it 'changes campaign user finalized status' do
      body = {
        data: {
          type: 'campaign_users',
          attributes: {
            finalized: true
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_user_scorings/" \
           "#{user_id}/change_finalized_campaign_score",
           params: body.to_json,
           headers: {
             'Content-Type' => 'application/vnd.api+json'
           }

      expect(response).to have_http_status(:ok)
      cf = JSON.parse(response.body)['data']
      expect(cf).to have_attribute(:campaign_scores_finalized).with_value(true)
      expect(campaign_user.reload.campaign_scores_finalized).to eq(true)
    end
  end

  describe 'POST /campaigns/:campaign_id/campaign_user_scorings/change_finalized_campaign_score_bulk' do
    it 'bulk changes campaign user finalized status' do
      body = {
        data: {
          type: 'campaign_users',
          attributes: {
            user_ids: [user_id],
            finalized: true
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/" \
           'campaign_user_scorings/change_finalized_campaign_score_bulk',
           params: body.to_json,
           headers: {
             'Content-Type' => 'application/vnd.api+json'
           }

      expect(response).to have_http_status(:ok)
      expect(campaign_user.reload.campaign_scores_finalized).to eq(true)
    end
  end

  describe 'POST /campaigns/:campaign_id/campaign_user_scorings/:user_id/rescore' do
    before do
      expect(CampaignFactorValue.where(campaign_id: campaign_id, user_id: user_id)).to be_empty
    end

    it 'rescores campaign user' do
      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_user_scorings/#{user_id}/rescore",
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      campaign_factor_value = CampaignFactorValue.find_by(campaign_id: campaign_id, user_id: user_id)
      expect(campaign_factor_value.value).to eq(4)
    end
  end

  describe 'POST /campaigns/:campaign_id/campaign_user_scorings/rescore_bulk' do
    it 'bulk rescores campaign users' do
      body = {
        data: {
          type: 'campaign_users',
          attributes: {
            user_ids: [user_id]
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_user_scorings/rescore_bulk",
           params: body.to_json,
           headers: {
             'Content-Type' => 'application/vnd.api+json'
           }

      expect(response).to have_http_status(:ok)
      expect(AdminJobRecord.last.operation).to eq('bulk_rescore_campaign_factors')
      expect(AdminJobRecord.last.data).to include({ 'user_ids' => [user_id],
                                                    'excluded_user_ids' => nil,
                                                    'campaign_id' => campaign.id })
    end
  end

  describe 'POST /campaigns/:campaign_id/campaign_user_scorings/import_external_campaign_scorings' do
    let(:file_path) { Rails.root.join('spec/fixtures/files/import_external_campaign_scoring/valid_file.csv') }
    let!(:external_user) { create(:user, email: 'user@example.com', project: campaign.project) }
    let!(:external_campaign_factor) do
      create(:campaign_factor, factor_type: :external_score, code: 'ext_code1', campaign: campaign)
    end
    let!(:external_campaign_factor2) do
      create(:campaign_factor, factor_type: :external_score, code: 'ext_code2', campaign: campaign)
    end

    it 'imports external campaign scorings' do
      file = Rack::Test::UploadedFile.new(file_path, 'text/csv')

      post "/api/v2/administration/campaigns/#{campaign_id}/campaign_user_scorings/import_external_campaign_scorings",
           params: { file: file },
           headers: { 'Content-Type' => 'multipart/form-data' }

      expect(response).to have_http_status(:ok)
      expect(AdminJobRecord.last.operation).to eq('import_external_campaign_scoring')
      expect(AdminJobRecord.last.data).to include({ 'campaign_id' => campaign.id })
    end
  end
end
