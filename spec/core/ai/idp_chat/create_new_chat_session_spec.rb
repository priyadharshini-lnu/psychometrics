# frozen_string_literal: true

require 'rails_helper'

describe AI::IdpChat::CreateNewChatSession do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:ai_assistant) { create(:assistant) }
  let!(:doc_ai_assistant) { create(:assistant) }
  let!(:skill_gap_ai_assistant) { create(:assistant) }
  let!(:idp_template) do
    create(:idp_template, project: campaign.project, one_click_idp_enabled: true, one_click_ai_assistant: ai_assistant,
      document_analysis_ai_assistant: doc_ai_assistant, skill_gap_report_analysis_ai_assistant: skill_gap_ai_assistant)
  end
  let!(:plan) { create(:user_idp_plan, user: user, idp_template: idp_template, campaign: campaign) }

  let(:ai_provider_config) do
    {
      'model_id' => 'gpt-4o-mini',
      'name' => 'OpenAI GPT-4o Mini',
      'context' => {
        'openai_api_key' => 'test-api-key'
      }
    }
  end

  before do
    allow(Settings).to receive(:ai_providers).and_return([ai_provider_config])
  end

  shared_context 'assistant service mocking' do
    let(:assistant_service_instance) { instance_double(AI::AssistantService) }

    before do
      allow(AI::AssistantService).to receive(:new).and_return(assistant_service_instance)
      allow(assistant_service_instance).to receive(:on).and_return(assistant_service_instance)
      allow(assistant_service_instance).to receive(:call)
    end
  end

  shared_context 'assistant chat setup' do
    let(:assistant_chat) { ai_assistant.for_user(user) }

    before do
      allow(ai_assistant).to receive(:for_user).and_return(assistant_chat)
      allow(assistant_chat).to receive(:with_assistant_context).and_return(assistant_chat)
      allow(assistant_chat).to receive(:with_temperature).with(0).and_return(assistant_chat)
    end
  end

  context 'when initializing chat' do
    include_context 'assistant service mocking'
    include_context 'assistant chat setup'

    it 'creates a new session and broadcasts :ok with new session' do
      expect(AI::AssistableService::Idp).to receive(:call).with(plan, user, 'hi', {}).and_call_original

      command = described_class.new(plan)
      expect { command.call }.to change { plan.reload.ai_assisted_idp_session }.from(nil)
    end
  end
end
