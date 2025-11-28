# frozen_string_literal: true

require 'rails_helper'

describe AI::AssistableService::DevelopmentActions do
  let!(:user) { create(:user) }
  let!(:campaign) { create(:campaign) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign) }
  let!(:skill) { create(:skill, name: 'Leadership', description: 'Leadership skills', skill_type: 'behavioral') }
  let!(:user_idp_skill) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill) }
  let!(:ai_assistant) { create(:assistant, assistant_type: :development_actions_assistant) }
  let!(:development_action1) { create(:development_action, name: 'Leadership Workshop', skills: [skill]) }
  let!(:development_action2) { create(:development_action, name: 'Team Building', skills: [skill]) }
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
    end
  end

  def create_existing_session
    chat = ai_assistant.for_user(user)
    existing_session = create(
      :assisted_user_development_actions_session,
      assistable: user_idp_skill,
      user: user
    )
    chat.update!(ai_assisted_user_session: existing_session)
    existing_session
  end

  def expect_session_status(session, status, error = nil)
    expect(session.reload.status).to eq(status)
    expect(session.reload.error).to eq(error) if error
  end

  describe '#call' do
    context 'when development actions assistance is not enabled' do
      before do
        allow(AI::Assistant).to receive(:where).
          with(assistant_type: :development_actions_assistant).and_return(double(first: nil))
      end

      it 'returns an error' do
        result = described_class.call(user_idp_skill, user, options)

        expect(result[:error]).
          to eq(I18n.t('administration.ai_assistants.errors.development_actions_assistance_not_enabled'))
      end

      it 'does not call AssistantService' do
        allow(AI::AssistantService).to receive(:new)

        described_class.new(user_idp_skill, user, options).call

        expect(AI::AssistantService).not_to have_received(:new)
      end
    end

    context 'when ai_assisted_development_actions_session does not exist' do
      include_context 'assistant service mocking'

      it 'creates a new ai_assisted_development_actions_session' do
        expect do
          described_class.new(user_idp_skill, user, options).call
        end.to change(AI::AssistedUserDevelopmentActionsSession, :count).by(1)

        ai_session = AI::AssistedUserDevelopmentActionsSession.find_by(assistable: user_idp_skill, user: user)
        expect(ai_session).to be_present
        expect(ai_session.user).to eq(user)
      end
    end

    context 'when ai_assisted_development_actions_session already exists' do
      include_context 'assistant service mocking'

      let!(:existing_session) { create_existing_session }

      it 'uses the existing ai_assisted_development_actions_session' do
        expect do
          described_class.new(user_idp_skill, user, options).call
        end.not_to change(AI::AssistedUserDevelopmentActionsSession, :count)

        current_session = AI::AssistedUserDevelopmentActionsSession.find_by(assistable: user_idp_skill, user: user)
        expect(current_session).to eq(existing_session)
      end
    end

    context 'when checking assistant context and tools' do
      include_context 'assistant service mocking'

      it 'includes correct skill information in assistant context' do
        service = described_class.new(user_idp_skill, user, options)
        context = service.send(:assistant_context)

        expect(context).to include(user_idp_skill.id.to_s)
        expect(context).to include(skill.name)
        expect(context).to include(skill.description)
        expect(context).to include(skill.skill_type)

        tools = service.send(:assistant_tools)
        expect(tools).to be_an(Array)
        expect(tools).to be_empty

        service.call
      end

      it 'passes correct parameters to AssistantService' do
        assistant_chat = ai_assistant.for_user(user)

        allow(assistant_chat).to receive(:with_assistant_context).and_return(assistant_chat)
        allow(ai_assistant).to receive(:for_user).and_return(assistant_chat)

        described_class.new(user_idp_skill, user, options).call

        session = AI::AssistedUserDevelopmentActionsSession.find_by(assistable: user_idp_skill, user: user)

        expect(AI::AssistantService).to have_received(:new) do |assistant_id, user_arg, prompt, options_hash|
          expect(assistant_id).to eq(ai_assistant.id)
          expect(user_arg).to eq(user)
          expect(prompt).to be_a(String)
          expect(options_hash[:chat]).to eq(session.latest_chat)
          expect(options_hash[:ignore_user_prompt]).to eq(false)
          expect(options_hash[:ask_params]).to be_nil
        end
      end
    end

    context 'when checking prompt data' do
      include_context 'assistant service mocking'

      it 'includes generation language and existing development actions' do
        user_idp_skill.user_idp_development_actions.create!(
          user_idp_plan: user_idp_plan,
          development_action: development_action1
        )
        user_idp_skill.user_idp_development_actions.create!(
          user_idp_plan: user_idp_plan,
          development_action: development_action2
        )

        service = described_class.new(user_idp_skill, user, options)
        prompt_data = service.send(:prompt_data)

        expect(prompt_data).to include(I18n.t('languages.en'))
        expect(prompt_data).to include(development_action1.name)
        expect(prompt_data).to include(development_action2.name)
      end

      it 'uses correct language when lang option is provided' do
        options_with_lang = { lang: 'es' }
        service = described_class.new(user_idp_skill, user, options_with_lang)
        prompt_data = service.send(:prompt_data)

        expect(prompt_data).to include(I18n.t('languages.es'))
      end
    end

    context 'when generation limit is reached' do
      let!(:existing_session) { create_existing_session }

      before do
        messages_relation = double('Messages Relation')
        assistant_messages = double('Assistant Messages')
        allow(existing_session).to receive(:messages).and_return(messages_relation)
        allow(messages_relation).to receive(:where).with(role: 'assistant').and_return(assistant_messages)
        allow(assistant_messages).to receive(:where).and_return(assistant_messages)
        allow(assistant_messages).to receive(:missing).with(:tool_calls).and_return(assistant_messages)
        allow(assistant_messages).to receive(:count).
          and_return(AI::AssistableService::DevelopmentActions::MAXIMUM_GENERATION_LIMIT)

        allow_any_instance_of(described_class).to receive(:session).and_return(existing_session)
      end

      it 'raises GenerateLimitReachedError and broadcasts error' do
        result = described_class.call(user_idp_skill, user, options)

        expect(result[:error]).to eq(I18n.t('errors.ai_assistant.max_generation_limit'))
      end
    end

    context 'when AssistantService succeeds' do
      include_context 'assistant chat setup'

      let!(:session) { create_existing_session }
      let(:generated_actions) do
        [
          {
            'name' => 'AI Generated Leadership Training',
            'description' => 'Comprehensive leadership development program',
            'learning_style' => 'structured_learning'
          },
          {
            'name' => 'Mentorship Program',
            'description' => 'One-on-one mentoring sessions',
            'learning_style' => 'experiential_learning'
          }
        ]
      end

      before do
        stub_wisper_publisher('AI::AssistantService', :call, :ok,
                              { message: { 'recommendations' => generated_actions } })
      end

      it 'marks session as completed and broadcasts success' do
        result = described_class.call(user_idp_skill, user, options)

        expect_session_status(session, 'completed')
        expect(result[:ok]).to eq(generated_actions)
      end

      it 'saves generated actions to session checkpoint' do
        described_class.call(user_idp_skill, user, options)

        session.reload
        expect(session.development_actions).to eq(generated_actions)
      end

      it 'appends to existing development actions' do
        existing_actions = [{ 'name' => 'Existing Action', 'description' => 'Already there' }]
        session.update!(development_actions: existing_actions)

        described_class.call(user_idp_skill, user, options)

        session.reload
        expect(session.development_actions).to eq(existing_actions + generated_actions)
      end
    end

    context 'when AssistantService fails' do
      include_context 'assistant chat setup'

      let!(:session) { create_existing_session }

      before do
        stub_wisper_publisher('AI::AssistantService', :call, :error, 'AI service failed')
      end

      it 'marks session as failed and broadcasts error' do
        result = described_class.call(user_idp_skill, user, options)

        expected_message = I18n.t('ai.errors.generic')
        expect_session_status(session, 'failed', expected_message)
        expect(result[:error]).to eq(expected_message)

        # Verify metadata is saved
        session.reload
        expect(session.meta).to include('error' => 'AI service failed')
        expect(session.meta).to include('error_class')
      end
    end

    context 'when checking dependencies parsing' do
      include_context 'assistant service mocking'

      it 'parses user_idp_skill data correctly' do
        service = described_class.new(user_idp_skill, user, options)

        expect(service.send(:skill)).to eq(skill)

        context = service.send(:assistant_context)
        expect(context).to include("<user_idp_skill id=\"#{user_idp_skill.id}\">")
        expect(context).to include("<skill_name>#{skill.name}</skill_name>")
        expect(context).to include("<skill_description>#{skill.description}</skill_description>")
        expect(context).to include("<skill_type>#{skill.skill_type}</skill_type>")
      end

      it 'parses existing development actions data correctly' do
        custom_action = create(:development_action,
                               name: 'Custom Action',
                               description: 'Custom description',
                               learning_style: 'structured_learning',
                               development_action_type: 'course')

        skill.skills_development_actions.create!(development_action: custom_action)

        service = described_class.new(user_idp_skill, user, options)
        added_actions_context = service.send(:added_development_actions)

        expect(added_actions_context).to include('<added_development_actions>')
        expect(added_actions_context).to include(development_action1.name)
        expect(added_actions_context).to include(development_action1.description)
        expect(added_actions_context).to include(development_action1.learning_style)
        expect(added_actions_context).to include(custom_action.name)
        expect(added_actions_context).to include(custom_action.description)
        expect(added_actions_context).to include(custom_action.learning_style)
        expect(added_actions_context).to include('</added_development_actions>')
      end
    end

    context 'when assistant response is missing recommendations' do
      include_context 'assistant chat setup'

      let!(:session) { create_existing_session }

      before do
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: {} })
      end

      it 'handles empty recommendations gracefully' do
        result = described_class.call(user_idp_skill, user, options)

        expect_session_status(session, 'completed')
        expect(result[:ok]).to eq([])
      end
    end
  end
end
