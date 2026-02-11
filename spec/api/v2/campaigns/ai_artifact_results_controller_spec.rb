# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Campaigns::AIArtifactResultsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let!(:ai_assistant) do
    assistant = create(:assistant)
    assistant.assistant_output_schema_keys.create!(key: 'summary')
    assistant.assistant_output_schema_keys.create!(key: 'feedback')
    assistant
  end
  let!(:ai_artifact) { create(:campaign_ai_artifact, campaign: campaign, ai_assistant: ai_assistant) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:ai_artifact_result) do
    create(
      :campaign_ai_artifact_result,
      campaign_ai_artifact: ai_artifact,
      user: user,
      results: { 'summary' => 'This is a summary', 'feedback' => 'Good' },
      error: nil,
      created_at: 2.days.ago
    )
  end
  let(:campaign_id) { campaign.id }
  let!(:api_key) { create(:api_key, user: superadmin) }
  let(:authorization) { "Basic #{Base64.strict_encode64("#{api_key.key}:#{api_key.token}")}" }

  before do
    sign_in(superadmin)
    campaign.project.client.client_feature.update!(ai_assistants: true)
    campaign.project.project_feature.update!(ai_assistants: true)
  end

  describe 'GET /api/v2/administration/campaigns/{campaign_id}/ai_artifact_results' do
    it 'returns AI artifact results list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/ai_artifact_results",
          headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(200)
      body = JSON.parse(response.body)
      expect(body).to have_key('data')
      expect(body).to have_key('meta')
      expect(body['meta']).to have_key('campaign_artifacts')

      # First user in the campaign
      user_result = body['data'].find { |d| d['id'].to_s == user.id.to_s }
      expect(user_result).not_to be_nil
      expect(user_result['type']).to eq('campaign_ai_artifact_results')
      expect(user_result['attributes']).to have_key('user')
      expect(user_result['attributes']['user']['data']['attributes']['name']).to eq(user.name)
      expect(user_result['attributes']['artifacts_results']['data']).to be_an(Array)
      artifact_result = user_result['attributes']['artifacts_results']['data'].find do |a|
        a['id'].to_s == ai_artifact.id.to_s
      end
      expect(artifact_result).not_to be_nil
      expect(artifact_result['attributes']['results']).to be_an(Array)
      expect(artifact_result['attributes']['results']).to contain_exactly(
        { 'key' => 'summary', 'type' => 'string', 'value' => 'This is a summary' },
        { 'key' => 'feedback', 'type' => 'string', 'value' => 'Good' }
      )
      expect(artifact_result['attributes']['error']).to be_nil

      # generated_at should be present and match the artifact result timestamp
      expect(user_result['attributes']).to have_key('generated_at')
      expect(Time.parse(user_result['attributes']['generated_at']).to_i).to eq(ai_artifact_result.updated_at.to_i)
    end

    it 'includes meta with all campaign artifacts' do
      get "/api/v2/administration/campaigns/#{campaign_id}/ai_artifact_results",
          headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(200)
      meta = JSON.parse(response.body)['meta']
      expect(meta).to have_key('campaign_artifacts')
      expect(meta['campaign_artifacts']).to be_an(Array)
      artifact_meta = meta['campaign_artifacts'].find { |a| a['id'].to_s == ai_artifact.id.to_s }
      expect(artifact_meta).not_to be_nil
      expect(artifact_meta).to have_key('name')
      expect(artifact_meta).to have_key('schema_keys')
    end

    it 'returns empty results when campaign has no artifacts' do
      campaign_without_artifacts = create(:campaign)
      campaign_without_artifacts.project.client.client_feature.update!(ai_assistants: true)
      campaign_without_artifacts.project.project_feature.update!(ai_assistants: true)
      user_without_artifacts = create(:user)
      create(:campaign_user, campaign: campaign_without_artifacts, user: user_without_artifacts)

      get "/api/v2/administration/campaigns/#{campaign_without_artifacts.id}/ai_artifact_results",
          headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(200)
      body = JSON.parse(response.body)
      expect(body).to have_key('data')
      expect(body['data']).to be_empty
      expect(body).to have_key('meta')
      expect(body['meta']['campaign_artifacts']).to be_empty
      expect(body['meta']['record_count']).to eq(0)
    end
  end

  describe 'GET /api/v2/administration/campaigns/{campaign_id}/ai_artifact_results/{user_id}' do
    it 'returns AI artifact results for a specific user' do
      get "/api/v2/administration/campaigns/#{campaign_id}/ai_artifact_results/#{user.id}",
          headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(200)
      body = JSON.parse(response.body)
      expect(body).to have_key('data')
      expect(body['meta']).to have_key('user')
      expect(body['meta']['user']['data']['id'].to_s).to eq(user.id.to_s)
      artifact_data = body['data'].first
      expect(artifact_data['type']).to eq('campaign_ai_artifact_results')
      expect(artifact_data['attributes']['artifact']).to have_key('name')
      expect(artifact_data['attributes']['artifact']).to have_key('code')
      expect(artifact_data['attributes']).to have_key('generated_at')
      expect(artifact_data['attributes']['results']).to be_an(Array)
      expect(artifact_data['attributes']['results']).to contain_exactly(
        { 'key' => 'summary', 'type' => 'string', 'value' => 'This is a summary' },
        { 'key' => 'feedback', 'type' => 'string', 'value' => 'Good' }
      )
    end

    it 'returns AI artifact results for user with no generated data' do
      new_user = create(:user)
      create(:campaign_user, campaign: campaign, user: new_user)

      get "/api/v2/administration/campaigns/#{campaign_id}/ai_artifact_results/#{new_user.id}",
          headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(200)
      body = JSON.parse(response.body)
      expect(body).to have_key('data')
      expect(body['meta']).to have_key('user')
      expect(body['meta']['user']['data']['id'].to_s).to eq(new_user.id.to_s)
      artifact_data = body['data'].first
      expect(artifact_data['type']).to eq('campaign_ai_artifact_results')
      expect(artifact_data['attributes']['artifact']).to have_key('name')
      expect(artifact_data['attributes']['artifact']).to have_key('code')
      expect(artifact_data['attributes']).to have_key('generated_at')
      expect(artifact_data['attributes']['results']).to be_an(Array)
      expect(artifact_data['attributes']['results']).to contain_exactly(
        { 'key' => 'summary', 'type' => 'string', 'value' => nil },
        { 'key' => 'feedback', 'type' => 'string', 'value' => nil }
      )
    end
  end
end
