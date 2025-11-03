# frozen_string_literal: true

require 'rails_helper'

describe AI::AssistableService::Base do
  let!(:user) { create(:user) }
  let!(:campaign) { create(:campaign) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign) }
  let!(:skill) { create(:skill, name: 'Leadership', description: 'Leadership skills', skill_type: 'behavioral') }
  let!(:user_idp_skill) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill) }
  let!(:ai_assistant) { create(:assistant, assistant_type: :development_actions_assistant) }
  let(:instructions) { 'Test instructions' }
  let(:options) { {} }

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

  # Create a concrete test class since Base is abstract
  let(:test_service_class) do
    assistant_instance = ai_assistant
    Class.new(AI::AssistableService::Base) do
      define_method :call do
        # No-op implementation for testing
      end

      private

      define_method :assistant do
        @assistant ||= assistant_instance
      end

      def assistant_context
        'Test context'
      end

      def assistant_tools
        []
      end

      def session_model
        AI::AssistedUserDevelopmentActionsSession
      end
    end
  end

  def create_service(assistable: user_idp_skill, current_user: user, instructions: nil, options: {})
    test_service_class.new(assistable, current_user, instructions, options)
  end

  describe '#session' do
    context 'when no session exists' do
      it 'creates a new session with a new chat' do
        expect do
          service = create_service
          session = service.session
          expect(session).to be_persisted
          expect(session.assistable).to eq(user_idp_skill)
          expect(session.user).to eq(user)
          expect(session.ai_assistant_chat).to be_present
        end.to change(AI::AssistedUserDevelopmentActionsSession, :count).by(1)
      end

      it 'creates the chat with assistant context' do
        expect(ai_assistant).to receive(:for_user).with(user, contextual_information: 'Test context').and_call_original

        service = create_service
        session = service.session

        expect(session.ai_assistant_chat).to be_present
      end

      it 'saves the session after creating it' do
        service = create_service
        session = service.session

        expect(session).to be_persisted
        expect(session.new_record?).to be false
      end
    end

    context 'when session already exists' do
      let!(:existing_chat) { ai_assistant.for_user(user) }
      let!(:existing_session) do
        create(:assisted_user_development_actions_session,
               assistable: user_idp_skill,
               user: user,
               ai_assistant_chat: existing_chat)
      end

      it 'uses the existing session without creating a new one' do
        expect do
          service = create_service
          session = service.session
          expect(session).to eq(existing_session)
        end.not_to change(AI::AssistedUserDevelopmentActionsSession, :count)
      end

      it 'uses the existing chat without creating a new one' do
        service = create_service
        session = service.session

        expect(session.ai_assistant_chat).to eq(existing_chat)
      end

      it 'does not modify the existing session' do
        original_updated_at = existing_session.updated_at

        service = create_service
        service.session

        expect(existing_session.reload.updated_at).to eq(original_updated_at)
      end
    end

    context 'when start_new_chat flag is true' do
      let(:options) { { start_new_chat: true } }
      let!(:existing_chat) { ai_assistant.for_user(user) }
      let!(:existing_session) do
        create(:assisted_user_development_actions_session,
               assistable: user_idp_skill,
               user: user,
               ai_assistant_chat: existing_chat)
      end

      it 'creates a new chat for the existing session' do
        original_chat = existing_session.ai_assistant_chat

        service = create_service(options: options)
        session = service.session

        expect(session).to eq(existing_session)
        expect(session.ai_assistant_chat).not_to eq(original_chat)
        expect(session.ai_assistant_chat).to be_present
      end

      it 'saves the session with the new chat' do
        original_chat_id = existing_session.ai_assistant_chat.id

        service = create_service(options: options)
        session = service.session

        existing_session.reload
        existing_session.association(:ai_assistant_chat).reload

        expect(existing_session.ai_assistant_chat.id).not_to eq(original_chat_id)
        expect(existing_session.ai_assistant_chat.id).to eq(session.ai_assistant_chat.id)
      end

      it 'creates the new chat with assistant context' do
        expect(ai_assistant).to receive(:for_user).with(user, contextual_information: 'Test context').and_call_original

        service = create_service(options: options)
        service.session
      end
    end

    context 'when start_new_chat flag is true and no existing session' do
      let(:options) { { start_new_chat: true } }

      it 'creates a new session with a new chat' do
        expect do
          service = create_service(options: options)
          session = service.session
          expect(session).to be_persisted
          expect(session.ai_assistant_chat).to be_present
        end.to change(AI::AssistedUserDevelopmentActionsSession, :count).by(1)
      end
    end
  end

  describe '#assistant_service' do
    it 'creates AssistantService with correct parameters' do
      service = create_service(instructions: instructions, options: options)

      mock_chat = double('chat_with_context')
      allow(service).to receive(:chat_with_context).and_return(mock_chat)

      expect(AI::AssistantService).to receive(:new).with(
        ai_assistant.id,
        user,
        instructions,
        chat: mock_chat,
        ignore_user_prompt: options[:ignore_user_prompt],
        chat_params: options[:chat_params]
      ).and_call_original

      service.send(:assistant_service)
    end

    it 'memoizes the assistant service instance' do
      service = create_service

      allow(service).to receive(:chat_with_context).and_return(double('chat'))

      first_call = service.send(:assistant_service)
      second_call = service.send(:assistant_service)

      expect(first_call).to be(second_call)
    end
  end

  describe '#chat_with_context' do
    it 'calls with_assistant_context on the assisted_session_chat with tools' do
      service = create_service
      session = service.session
      chat = session.ai_assistant_chat

      expect(chat).to receive(:with_assistant_context).with(tools: [])

      service.send(:chat_with_context)
    end
  end

  describe 'integration with different assistables' do
    context 'with UserIdpPlan as assistable' do
      let!(:idp_assistant) { create(:assistant, assistant_type: :idp_assistant) }
      let(:idp_service_class) do
        Class.new(AI::AssistableService::Base) do
          def call; end

          private

          def assistant
            @assistant ||= AI::Assistant.where(assistant_type: :idp_assistant).first
          end

          def assistant_context
            'IDP context'
          end

          def assistant_tools
            []
          end

          def session_model
            AI::AssistedUserIdpSession
          end
        end
      end

      it 'creates session with UserIdpPlan as assistable' do
        service = idp_service_class.new(user_idp_plan, user, instructions, options)

        expect do
          session = service.session
          expect(session.assistable).to eq(user_idp_plan)
          expect(session).to be_a(AI::AssistedUserIdpSession)
        end.to change(AI::AssistedUserIdpSession, :count).by(1)
      end
    end
  end
end
