# frozen_string_literal: true

require 'rails_helper'

describe AI::IdpAssistantService do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:ai_assistant) { create(:assistant) }
  let!(:idp_template) do
    create(:idp_template, project: campaign.project, one_click_idp_enabled: true, one_click_ai_assistant: ai_assistant)
  end
  let!(:instructions) { 'Hello' }
  let!(:plan) { create(:user_idp_plan, user: user, idp_template: idp_template, campaign: campaign) }
  let(:options) { {} }

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

  def create_existing_session
    create(:assisted_user_idp_session, assistable: plan, user: user, ai_assistant_chat: ai_assistant.for_user(user))
  end

  def expect_session_status(session, status, error = nil)
    expect(session.reload.status).to eq(status)
    expect(session.reload.error).to eq(error) if error
  end

  describe '#call' do
    context 'when one-click IDP assistance is not enabled' do
      before do
        idp_template.update!(one_click_idp_enabled: false)
      end

      it 'returns an error with the correct translation' do
        result = described_class.call(plan, user, instructions, options)

        expect(result[:error]).to eq(I18n.t('administration.ai_assistants.errors.one_click_idp_assistance_not_enabled'))
      end

      it 'does not call AssistantService' do
        allow(AI::AssistantService).to receive(:new)

        described_class.new(plan, user, instructions, options).call

        expect(AI::AssistantService).not_to have_received(:new)
      end
    end

    context 'when ai_assisted_idp_session does not exist' do
      include_context 'assistant service mocking'

      it 'creates a new ai_assisted_idp_session' do
        expect do
          described_class.new(plan, user, instructions, options).call
        end.to change(AI::AssistedUserIdpSession, :count).by(1)

        ai_session = plan.reload.ai_assisted_idp_session
        expect(ai_session).to be_present
        expect(ai_session.user).to eq(user)
      end

      it 'updates plan status to ai_assisted_idp_in_progress when creating a new session' do
        expect(plan.status).not_to eq('ai_assisted_idp_in_progress')

        described_class.new(plan, user, instructions, options).call

        expect(plan.reload.status).to eq('ai_assisted_idp_in_progress')
      end
    end

    context 'when ai_assisted_idp_session already exists' do
      include_context 'assistant service mocking'

      let!(:existing_session) { create_existing_session }

      it 'uses the existing ai_assisted_idp_session' do
        expect do
          described_class.new(plan, user, instructions, options).call
        end.not_to change(AI::AssistedUserIdpSession, :count)

        expect(plan.reload.ai_assisted_idp_session).to eq(existing_session)
      end
    end

    context 'when checking chat tools and parameters' do
      include_context 'assistant service mocking'

      it 'passes correct tools to the chat context' do
        assistant_chat = ai_assistant.for_user(user)

        allow(assistant_chat).to receive(:with_assistant_context) do |args|
          expect(args[:tools]).to be_an(Array)
          expect(args[:tools].size).to eq(3)
          expect(args[:tools]).to include(AI::Tools::Idp::AddSkillToPlan)
          expect(args[:tools]).to include(AI::Tools::Idp::AvailableSkillsAndDevelopmentActions)
          expect(args[:tools]).to include(AI::Tools::Idp::DocumentAnalyzer)

          assistant_chat
        end

        allow(ai_assistant).to receive(:for_user).and_return(assistant_chat)

        described_class.new(plan, user, instructions, options).call

        expect(assistant_chat).to have_received(:with_assistant_context)
      end

      it 'passes correct parameters to AssistantService' do
        assistant_chat = ai_assistant.for_user(user)

        allow(assistant_chat).to receive(:with_assistant_context).and_return(assistant_chat)
        allow(assistant_chat).to receive(:with_temperature).with(0).and_return(assistant_chat)
        allow(ai_assistant).to receive(:for_user).and_return(assistant_chat)

        described_class.new(plan, user, instructions, options).call

        expect(AI::AssistantService).to have_received(:new).with(
          ai_assistant.id,
          user,
          instructions,
          chat: assistant_chat,
          ignore_user_prompt: true
        )
      end
    end

    context 'when AssistantService succeeds' do
      include_context 'assistant chat setup'

      let!(:session) { create_existing_session }

      before do
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: 'AI analysis complete' })
      end

      it 'marks session as completed and broadcasts success' do
        result = described_class.call(plan, user, instructions, options)

        expect_session_status(session, 'completed')
        expect(result[:ok]).to eq({
          content: 'AI analysis complete',
          role: 'assistant'
        })
      end
    end

    context 'when AssistantService fails' do
      include_context 'assistant chat setup'

      let!(:session) { create_existing_session }

      before do
        stub_wisper_publisher('AI::AssistantService', :call, :error, 'AI service failed')
      end

      it 'marks session as failed and broadcasts error' do
        result = described_class.call(plan, user, instructions, options)

        expect_session_status(session, 'failed', 'AI service failed')
        expect(result[:error]).to eq('AI service failed')
      end
    end
  end
end
