# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Campaigns::AIArtifactResultsController, swagger_doc: 'v2/swagger.json',
type: :request do
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
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/ai_artifact_results' do
    get 'AI Artifact Results' do
      operationId 'AIArtifactResults'
      description 'Fetch AI artifact results for a campaign'
      tags 'AIArtifactResults'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'AI artifact results list' do
        run_test! do |response|
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
      end

      response '200', 'meta includes all campaign artifacts' do
        run_test! do |response|
          meta = JSON.parse(response.body)['meta']
          expect(meta).to have_key('campaign_artifacts')
          expect(meta['campaign_artifacts']).to be_an(Array)
          artifact_meta = meta['campaign_artifacts'].find { |a| a['id'].to_s == ai_artifact.id.to_s }
          expect(artifact_meta).not_to be_nil
          expect(artifact_meta).to have_key('name')
          expect(artifact_meta).to have_key('schema_keys')
        end
      end

      response '200', 'empty results when campaign has no artifacts' do
        let!(:campaign_without_artifacts) { create(:campaign) }
        let!(:user_without_artifacts) { create(:user) }
        let!(:campaign_user_without_artifacts) do
          create(:campaign_user, campaign: campaign_without_artifacts, user: user_without_artifacts)
        end
        let(:campaign_id) { campaign_without_artifacts.id }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body).to have_key('data')
          expect(body['data']).to be_empty
          expect(body).to have_key('meta')
          expect(body['meta']['campaign_artifacts']).to be_empty
          expect(body['meta']['record_count']).to eq(0)
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/ai_artifact_results/{user_id}' do
    get 'Show AI Artifact Results for User' do
      operationId 'ShowAIArtifactResults'
      description 'Fetch all AI artifact results for a user in a campaign'
      tags 'AIArtifactResults'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :user_id, in: :path, type: :string

      response '200', 'AI artifact results for user' do
        let(:user_id) { user.id }
        run_test! do |response|
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
      end

      response '200', 'AI artifact results for user for which data is not generated' do
        let!(:new_user) do
          user = create(:user)
          create(:campaign_user, campaign: campaign, user: user)
          user
        end
        let!(:user_id) { new_user.id }
        run_test! do |response|
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
  end
end
