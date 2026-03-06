# frozen_string_literal: true

require 'rails_helper'

describe AI::CampaignArtifacts::GenerateArtifactRequestHandler do
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
  let(:current_user) { create(:user) }

  let(:params) do
    {
      campaign_id: campaign.id,
      artifact_id: ai_artifact.id,
      user_id: user.id
    }
  end

  let(:context) do
    {
      async_request_uuid: SecureRandom.uuid,
      current_user: current_user
    }
  end

  describe '#call' do
    context 'when result generation succeeds' do
      let!(:artifact_result) do
        create(:campaign_ai_artifact_result,
               campaign_ai_artifact: ai_artifact,
               user: user,
               results: { 'summary' => 'Test summary', 'feedback' => 'Test feedback' })
      end

      before do
        stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :ok, 'assistant response')
      end

      it 'returns response data with artifact information' do
        result = nil
        described_class.new(params: params, context: context).on(:ok) do |async_response|
          result = async_response
        end.call

        expect(result).to be_present
        expect(result.response_data).to be_present
        expect(result.response_data[:data]).to be_present
        expect(result.response_data[:data]['attributes']['artifact']).to be_present
        expect(result.response_data[:data]['attributes']['artifact'][:id]).to eq(ai_artifact.id)
        expect(result.response_data[:meta][:user]).to be_present
      end
    end

    context 'when result generation fails' do
      let(:error_message) { 'Artifact generation failed' }
      let(:error) { StandardError.new(error_message) }

      before do
        stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :error, error_message, error)
      end

      it 'returns response data with error message' do
        result = nil
        described_class.new(params: params, context: context).on(:ok) do |async_response|
          result = async_response
        end.call

        expect(result).to be_present
        expect(result.response_data).to be_present
        expect(result.response_data[:data]['attributes']['error']).to eq(error_message)
      end
    end
  end
end
