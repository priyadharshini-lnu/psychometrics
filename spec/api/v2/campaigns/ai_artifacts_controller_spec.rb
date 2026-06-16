# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Campaigns::AIArtifactsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:campaign) { create(:campaign) }
  let!(:ai_assistant) do
    assistant = create(:assistant)
    assistant.assistant_output_schema_keys.create!(key: 'summary')
    assistant.assistant_output_schema_keys.create!(key: 'feedback')
    assistant
  end
  let!(:ai_artifact) { create(:campaign_ai_artifact, campaign: campaign, ai_assistant: ai_assistant) }
  let!(:assessment) { create(:assessment) }
  let!(:question1) { create(:question, assessment: assessment, name: 'Question 1', type: 'MultipleChoice') }
  let!(:question2) { create(:question, assessment: assessment, name: 'Question 2', type: 'TextEntry') }
  let(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let(:campaign_id) { campaign.id }
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
  before do
    sign_in(superadmin)
    campaign.project.client.client_feature.update!(ai_assistants: true)
    campaign.project.project_feature.update!(ai_assistants: true)
    question1.update!(props: { 'questionText' => 'What is your favorite color?' })
    question2.update!(props: { 'questionText' => 'Please describe your experience.' })
  end

  describe 'GET /api/v2/administration/campaigns/:campaign_id/ai_artifacts' do
    it 'fetches AI artifacts list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts"

      expect(response).to have_http_status(:ok)
      d = JSON.parse(response.body)['data'].first
      expect(d).to have_key('id')
      expect(d).to have_key('type')
      expect(d['type']).to eq('ai_artifacts')
      expect(d['attributes']).to have_key('name')
      expect(d['attributes']).to have_key('code')
      expect(d['attributes']).to have_key('dependencies_attributes')
      expect(d['attributes']).to have_key('instructions')
      expect(d['attributes']).to have_key('include_all_datasheet_columns')

      # Test for AI assistant relationship
      expect(d).to have_key('relationships')
      expect(d['relationships']).to have_key('ai_assistant')
      expect(d['relationships']['ai_assistant']['data']['id']).to eq(ai_assistant.id.to_s)
      expect(d['relationships']['ai_assistant']['data']['type']).to eq('ai_assistants')
    end

    it 'fetches AI artifacts list with included ai_assistant' do
      get "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts?include=ai_assistant"

      expect(response).to have_http_status(:ok)
      response_data = JSON.parse(response.body)
      d = response_data['data'].first

      # Test basic structure
      expect(d).to have_key('id')
      expect(d).to have_key('type')
      expect(d['type']).to eq('ai_artifacts')

      # Test for AI assistant relationship
      expect(d).to have_key('relationships')
      expect(d['relationships']).to have_key('ai_assistant')
      expect(d['relationships']['ai_assistant']['data']['id']).to eq(ai_assistant.id.to_s)
      expect(d['relationships']['ai_assistant']['data']['type']).to eq('ai_assistants')

      expect(response_data).to have_key('included')
      included_assistant = response_data['included'].find { |item| item['type'] == 'ai_assistants' }
      expect(included_assistant).not_to be_nil
      expect(included_assistant['id']).to eq(ai_assistant.id.to_s)
      expect(included_assistant['type']).to eq('ai_assistants')
      expect(included_assistant['attributes']).to have_key('name')
      expect(included_assistant['attributes']['name']).to eq(ai_assistant.name)
    end

    it 'returns only artifacts for the given campaign' do
      other_campaign = create(:campaign)
      other_ai_artifact = create(:campaign_ai_artifact, campaign: other_campaign)

      get "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts"

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      ids = data.pluck('id')
      expect(ids.include?(other_ai_artifact.id.to_s)).to be false
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/ai_artifacts' do
    it 'creates AI artifact' do
      body = {
        data: {
          type: 'ai_artifacts',
          attributes: {
            name: 'New Artifact',
            code: 'new_artifact',
            dependencies_attributes: {
              campaign_factors: [],
              questions: [],
              sheet_columns: []
            },
            instructions: 'Instructions for the new artifact',
            include_all_datasheet_columns: false
          },
          relationships: {
            ai_assistant: {
              data: {
                type: 'ai_assistants',
                id: ai_assistant.id.to_s
              }
            },
            campaign: {
              data: {
                type: 'campaigns',
                id: campaign.id.to_s
              }
            }
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      d = JSON.parse(response.body)['data']
      expect(d).to have_key('id')
      expect(d).to have_key('type')
      expect(d['type']).to eq('ai_artifacts')
      expect(d['attributes']['name']).to eq('New Artifact')
      expect(d['attributes']['code']).to eq('new_artifact')
      expect(d['attributes']['include_all_datasheet_columns']).to be false
      expect(d).to have_key('relationships')
      expect(d['relationships']).to have_key('ai_assistant')
      expect(d['relationships']['ai_assistant']['data']['id']).to eq(ai_assistant.id.to_s)
    end

    it 'creates AI artifact with dependencies' do
      campaign_factor = create(:campaign_factor, campaign: campaign, code: 'leadership', name: 'Leadership Score')
      datasheet = create(:datasheet, campaign: campaign)
      sheet_column = create(:sheet_column, sheet: datasheet, name: 'name', column_type: 'string')

      body = {
        data: {
          type: 'ai_artifacts',
          attributes: {
            name: 'New Artifact with Dependencies',
            code: 'new_artifact_with_deps',
            dependencies_attributes: {
              campaign_factors: [
                {
                  id: campaign_factor.id,
                  name: campaign_factor.name,
                  code: campaign_factor.code
                }
              ],
              questions: [
                {
                  id: question1.id,
                  text: question1.props&.dig('questionText') || question1.name,
                  assessment_id: assessment.id,
                  assessment_name: assessment.name
                }
              ],
              sheet_columns: [
                {
                  id: sheet_column.id,
                  name: sheet_column.name
                }
              ]
            },
            instructions: 'Instructions for the new artifact with dependencies',
            include_all_datasheet_columns: false
          },
          relationships: {
            ai_assistant: {
              data: {
                type: 'ai_assistants',
                id: ai_assistant.id.to_s
              }
            },
            campaign: {
              data: {
                type: 'campaigns',
                id: campaign.id.to_s
              }
            }
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      d = JSON.parse(response.body)['data']
      expect(d).to have_key('id')
      expect(d).to have_key('type')
      expect(d['type']).to eq('ai_artifacts')
      expect(d['attributes']['name']).to eq('New Artifact with Dependencies')
      expect(d['attributes']['code']).to eq('new_artifact_with_deps')

      expect(d['attributes']['dependencies_attributes']['campaign_factors'].length).to eq(1)
      expect(d['attributes']['dependencies_attributes']['questions'].length).to eq(1)
      expect(d['attributes']['dependencies_attributes']['sheet_columns'].length).to eq(1)

      created_artifact = AI::CampaignArtifact.find(d['id'])
      expect(created_artifact.dependencies.where(dependency_type: 'CampaignFactor').count).to eq(1)
      expect(created_artifact.dependencies.where(dependency_type: 'Question').count).to eq(1)
      expect(created_artifact.dependencies.where(dependency_type: 'SheetColumn').count).to eq(1)

      expect(d).to have_key('relationships')
      expect(d['relationships']).to have_key('ai_assistant')
      expect(d['relationships']['ai_assistant']['data']['id']).to eq(ai_assistant.id.to_s)
    end
  end

  describe 'GET /api/v2/administration/campaigns/:campaign_id/ai_artifacts/:id' do
    it 'fetches AI artifact details' do
      get "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts/#{ai_artifact.id}"

      expect(response).to have_http_status(:ok)
      d = JSON.parse(response.body)['data']
      expect(d).to have_key('id')
      expect(d).to have_key('type')
      expect(d['type']).to eq('ai_artifacts')
      expect(d['attributes']).to have_key('name')
      expect(d['attributes']).to have_key('code')
      expect(d['attributes']).to have_key('dependencies_attributes')
      expect(d['attributes']).to have_key('instructions')
      expect(d['attributes']).to have_key('include_all_datasheet_columns')
      expect(d).to have_key('relationships')
      expect(d['relationships']).to have_key('ai_assistant')
      expect(d['relationships']['ai_assistant']['data']['id']).to eq(ai_assistant.id.to_s)
    end

    it 'fetches AI artifact with dependencies data' do
      ai_artifact.dependencies.create!(
        dependency_type: 'Question',
        dependency_id: question1.id
      )
      ai_artifact.dependencies.create!(
        dependency_type: 'Question',
        dependency_id: question2.id
      )

      get "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts/#{ai_artifact.id}"

      expect(response).to have_http_status(:ok)
      d = JSON.parse(response.body)['data']
      expect(d['attributes']['dependencies_attributes']).to be_a(Hash)
      expect(d['attributes']['dependencies_attributes']['questions']).to be_an(Array)
      expect(d['attributes']['dependencies_attributes']['questions'].length).to eq(2)

      questions_data = d['attributes']['dependencies_attributes']['questions']
      question_ids = questions_data.pluck('id')
      expect(question_ids).to contain_exactly(question1.id.to_s, question2.id.to_s)

      question1_data = questions_data.find { |q| q['id'] == question1.id.to_s }
      expect(question1_data['question_text']).to eq('What is your favorite color?')
      expect(question1_data['assessment_id']).to eq(assessment.id.to_s)
      expect(question1_data['assessment_name']).to eq(assessment.name)

      question2_data = questions_data.find { |q| q['id'] == question2.id.to_s }
      expect(question2_data['question_text']).to eq('Please describe your experience.')
      expect(question2_data['assessment_id']).to eq(assessment.id.to_s)
      expect(question2_data['assessment_name']).to eq(assessment.name)
    end

    it 'fetches AI artifact with deep includes' do
      expected_schema_keys = ai_assistant.assistant_output_schema_keys

      get "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts/#{ai_artifact.id}?" \
          'include=ai_assistant.assistant_output_schema_keys'

      expect(response).to have_http_status(:ok)
      response_data = JSON.parse(response.body)

      included_assistant = response_data['included'].find { |item| item['type'] == 'ai_assistants' }
      expect(included_assistant).not_to be_nil
      expect(included_assistant['id']).to eq(ai_assistant.id.to_s)
      expect(included_assistant['attributes']).to have_key('name')
      expect(included_assistant).to have_key('relationships')
      expect(included_assistant['relationships']).to have_key('assistant_output_schema_keys')

      schema_keys = response_data['included'].select { |item| item['type'] == 'assistant_output_schema_keys' }
      expect(schema_keys).not_to be_empty
      expect(schema_keys.pluck('id').sort).to eq(expected_schema_keys.pluck(:id).sort.map(&:to_s))
      expect(schema_keys.first['attributes']).to have_key('key')
      expect(schema_keys.first['attributes']).to have_key('description')
      expect(schema_keys.first['attributes']).to have_key('key_type')
    end
  end

  describe 'PATCH /api/v2/administration/campaigns/:campaign_id/ai_artifacts/:id' do
    it 'updates AI artifact' do
      new_ai_assistant = create(:assistant, name: 'New AI Assistant')

      body = {
        data: {
          id: ai_artifact.id.to_s,
          type: 'ai_artifacts',
          attributes: {
            name: 'Updated Artifact Name',
            code: 'updated_artifact',
            dependencies_attributes: {
              campaign_factors: [],
              questions: [],
              sheet_columns: []
            },
            instructions: 'Updated instructions',
            include_all_datasheet_columns: true
          },
          relationships: {
            ai_assistant: {
              data: {
                type: 'ai_assistants',
                id: new_ai_assistant.id.to_s
              }
            }
          }
        }
      }

      patch "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts/#{ai_artifact.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      d = JSON.parse(response.body)['data']
      expect(d).to have_key('id')
      expect(d).to have_key('type')
      expect(d['type']).to eq('ai_artifacts')
      expect(d['attributes']['name']).to eq('Updated Artifact Name')
      expect(d['attributes']['code']).to eq('updated_artifact')
      expect(d['attributes']['include_all_datasheet_columns']).to be true
      expect(d).to have_key('relationships')
      expect(d['relationships']).to have_key('ai_assistant')

      expect(d['relationships']['ai_assistant']['data']['id']).to eq(new_ai_assistant.id.to_s)

      updated_artifact = AI::CampaignArtifact.find(ai_artifact.id)
      expect(updated_artifact.ai_assistant_id).to eq(new_ai_assistant.id)
    end
  end

  describe 'DELETE /api/v2/administration/campaigns/:campaign_id/ai_artifacts/:id' do
    it 'deletes AI artifact' do
      delete "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts/#{ai_artifact.id}"

      expect(response).to have_http_status(:no_content)
      expect(response.body).to be_empty
      expect(AI::CampaignArtifact.exists?(ai_artifact.id)).to be false
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/ai_artifacts/generate' do
    it 'queues AI artifact generation request and returns async_request_uuid' do
      body = {
        artifact_id: ai_artifact.id.to_s,
        user_id: user.id.to_s
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts/generate",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      response_body = JSON.parse(response.body)
      expect(response_body).to have_key('async_request_uuid')
      expect(response_body['async_request_uuid']).to be_present
      expect(AsyncRequestHandlerJob).to have_been_enqueued.with(
        hash_including(
          context: hash_including(
            params: hash_including(
              'artifact_id' => ai_artifact.id.to_s,
              'user_id' => user.id.to_s,
              'campaign_id' => campaign.id
            )
          ),
          handler: AI::CampaignArtifacts::GenerateArtifactRequestHandler
        )
      )
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/ai_artifacts/:id/test_generate' do
    it 'generates AI artifact test results successfully' do
      test_data = { 'name' => 'John Doe', 'score' => 85 }
      body = {
        data: {
          attributes: {
            test_data: test_data
          }
        }
      }
      results = {
        results: { 'summary' => 'Test generated summary', 'feedback' => 'Test feedback' },
        parsed_dependencies: 'Test dependencies'
      }

      stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :ok, results)

      post "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts/#{ai_artifact.id}/test_generate",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      d = JSON.parse(response.body)['data']
      expect(d).to have_key('type')
      expect(d['type']).to eq('campaign_ai_artifact_results')
      expect(d['attributes']).to have_key('results')
      expect(d['attributes']['results']).to be_an(Array)
      expect(d['attributes']['results']).to contain_exactly(
        { 'key' => 'summary', 'type' => 'string', 'value' => 'Test generated summary' },
        { 'key' => 'feedback', 'type' => 'string', 'value' => 'Test feedback' }
      )
      expect(d['attributes']).to have_key('parsed_dependencies')
      expect(d['attributes']['parsed_dependencies']).to eq(results[:parsed_dependencies])
    end

    it 'returns error when AI artifact test results generation fails' do
      body = {
        data: {
          attributes: {
            test_data: { 'invalid' => 'data' }.to_s
          }
        }
      }

      stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :error, 'Test generation error')

      post "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts/#{ai_artifact.id}/test_generate",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors']
      expect(errors).to be_an(Array)
      expect(errors.first['detail']).to eq('Test generation error')
    end
  end

  describe 'POST /api/v2/administration/campaigns/:campaign_id/ai_artifacts/bulk_generate' do
    it 'triggers bulk generate job' do
      user_ids = [campaign_user.user_id]
      body = {
        data: {
          type: 'campaign_users',
          attributes: {
            user_ids: user_ids
          }
        }
      }

      post "/api/v2/administration/campaigns/#{campaign_id}/ai_artifacts/bulk_generate",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/json' }

      expect(response).to have_http_status(:ok)
      job = AdminJobRecord.last
      expect(job.operation).to eq('bulk_generate_user_campaign_ai_artifact_results')
      expect(job.data).to include({
        'user_ids' => user_ids,
        'campaign_id' => campaign.id
      })
    end
  end
end
