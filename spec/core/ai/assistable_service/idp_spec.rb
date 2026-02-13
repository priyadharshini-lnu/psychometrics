# frozen_string_literal: true

require 'rails_helper'

describe AI::AssistableService::Idp do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:current_job_role) { create(:job_role, name: 'Test Role', code: 'test_role', description: 'Test description') }
  let!(:campaign_user) { create(:campaign_user, user: user, campaign: campaign, current_job_role: current_job_role) }
  let!(:ai_assistant) { create(:assistant) }
  let!(:doc_ai_assistant) { create(:assistant) }
  let!(:skill_gap_ai_assistant) { create(:assistant) }
  let!(:idp_template) do
    create(:idp_template, project: campaign.project, one_click_idp_enabled: true, one_click_ai_assistant: ai_assistant,
      document_analysis_ai_assistant: doc_ai_assistant, skill_gap_report_analysis_ai_assistant: skill_gap_ai_assistant)
  end
  let!(:instructions) { 'Hello' }
  let!(:plan) { create(:user_idp_plan, user: user, idp_template: idp_template, campaign: campaign) }
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
    allow(Settings.features).to receive(:ai_assistant_enabled).and_return(true)

    # Ensure project has proper feature flags enabled by default
    campaign.project.project_feature.update!(ai_assisted_idp: true)
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

  def create_existing_session
    chat = ai_assistant.for_user(user)
    existing_session = create(:assisted_user_idp_session, assistable: plan, user: user)
    chat.update!(ai_assisted_user_session: existing_session)
    existing_session
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

    context 'when assistance is disabled due to feature flags' do
      shared_examples 'returns feature disabled error' do
        it 'returns an error with message' do
          result = described_class.call(plan, user, instructions, options)

          expect(result[:error]).to eq(
            I18n.t('administration.ai_assistants.errors.one_click_idp_assistance_not_enabled')
          )
        end

        it 'does not call AssistantService' do
          allow(AI::AssistantService).to receive(:new)

          described_class.new(plan, user, instructions, options).call

          expect(AI::AssistantService).not_to have_received(:new)
        end
      end

      context 'when global AI assistant feature is disabled' do
        before do
          allow(Settings.features).to receive(:ai_assistant_enabled).and_return(false)
        end

        include_examples 'returns feature disabled error'
      end

      context 'when project AI assisted IDP feature is disabled' do
        before do
          campaign.project.project_feature.update!(ai_assisted_idp: false)
        end

        include_examples 'returns feature disabled error'
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

    context 'when calling the service' do
      include_context 'assistant service mocking'

      it 'changes assistable approval_status from not_started to ai_assisted_idp_in_progress' do
        plan.update!(approval_status: :not_started)
        expect(plan.approval_status).to eq('not_started')

        described_class.new(plan, user, instructions, options).call

        expect(plan.reload.approval_status).to eq('ai_assisted_idp_in_progress')
      end
    end

    context 'when checking chat tools and parameters' do
      include_context 'assistant service mocking'

      it 'includes campaign user dependency in assistant context' do
        assistant_chat = ai_assistant.for_user(user)

        allow(ai_assistant).to receive(:for_user) do |_user, options|
          context = options[:contextual_information]
          expect(context).to include('<current_job_role>')
          expect(context).to include('<name>Test Role</name>')
          expect(context).to include('<code>test_role</code>')
          expect(context).to include('<description>Test description</description>')
          assistant_chat
        end
        allow(assistant_chat).to receive(:with_assistant_context).and_return(assistant_chat)
        allow(assistant_chat).to receive(:with_temperature).with(0).and_return(assistant_chat)

        described_class.new(plan, user, instructions, options).call

        expect(ai_assistant).to have_received(:for_user)
      end

      it 'passes locale option to UserData parser' do
        locale = 'fr'
        options = { locale: locale }

        user_data_parser = instance_double(AI::Utils::DependencyParser::UserData)
        allow(user_data_parser).to receive(:parse).and_return('<user_data></user_data>')

        allow(AI::Utils::DependencyParser::UserData).to receive(:new) do |_user, args|
          expect(args[:locale]).to eq(locale)
          user_data_parser
        end

        described_class.new(plan, user, instructions, options).call

        expect(AI::Utils::DependencyParser::UserData).to have_received(:new)
      end

      context 'assistant tools' do
        let(:service) { described_class.new(plan, user, instructions, options) }
        let(:assistant_tools) { service.send(:assistant_tools) }

        it 'includes all tools when both assistants are configured' do
          expect(assistant_tools.map(&:class)).to contain_exactly(
            AI::Tools::Idp::AttachmentAnalysis,
            AI::Tools::Idp::SkillGapReportAnalysis,
            AI::Tools::Idp::AddSkillToPlan,
            AI::Tools::Idp::AvailableSkillsAndDevelopmentActions
          )
        end

        it 'excludes AttachmentAnalysis when document assistant is missing' do
          idp_template.update!(document_analysis_ai_assistant_id: nil)

          expect(assistant_tools.map(&:class)).to contain_exactly(
            AI::Tools::Idp::SkillGapReportAnalysis,
            AI::Tools::Idp::AddSkillToPlan,
            AI::Tools::Idp::AvailableSkillsAndDevelopmentActions
          )
        end

        it 'excludes SkillGapReportAnalysis when skill-gap assistant is missing' do
          idp_template.update!(skill_gap_report_analysis_ai_assistant_id: nil)

          expect(assistant_tools.map(&:class)).to contain_exactly(
            AI::Tools::Idp::AttachmentAnalysis,
            AI::Tools::Idp::AddSkillToPlan,
            AI::Tools::Idp::AvailableSkillsAndDevelopmentActions
          )
        end
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
          ignore_user_prompt: true,
          ask_params: nil,
          prompt_template_context: nil,
          params: {}
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

        expected_message = I18n.t('ai.errors.generic')
        expect_session_status(session, 'failed', expected_message)
        expect(result[:error]).to eq(expected_message)

        # Verify metadata is saved
        session.reload
        expect(session.meta).to include('error' => 'AI service failed')
        expect(session.meta).to include('error_class')
      end
    end

    context 'when start_new_chat flag is passed' do
      include_context 'assistant service mocking'

      let!(:existing_session) { create_existing_session }
      let!(:original_chat) { existing_session.latest_chat }
      let(:new_chat) { ai_assistant.for_user(user) }
      let(:options) { { start_new_chat: true } }

      before do
        allow(ai_assistant).to receive(:for_user).and_return(new_chat)
      end

      it 'creates a new chat for the existing session' do
        described_class.new(plan, user, instructions, options).call

        expect(plan.reload.ai_assisted_idp_session.latest_chat).to eq(new_chat)
        expect(plan.reload.ai_assisted_idp_session.latest_chat).not_to eq(original_chat)
      end
    end

    context 'when start_new_chat flag is not passed' do
      include_context 'assistant service mocking'

      let!(:existing_session) { create_existing_session }
      let(:original_chat) { existing_session.latest_chat }
      let(:options) { {} }

      before do
        allow(original_chat).to receive(:with_assistant_context).and_return(original_chat)
      end

      it 'uses the existing chat without creating a new one' do
        described_class.new(plan, user, instructions, options).call

        expect(plan.reload.ai_assisted_idp_session.latest_chat).to eq(original_chat)
      end
    end
  end

  describe '#prompt_template_context' do
    let(:service) { described_class.new(plan, user, instructions, options) }

    it 'returns the correct context hash with campaign and user' do
      context = service.send(:prompt_template_context)

      expect(context).to be_a(Hash)
      expect(context[:campaign]).to eq(campaign)
      expect(context[:user]).to eq(user)
    end

    it 'includes campaign from the assistable' do
      context = service.send(:prompt_template_context)

      expect(context[:campaign]).to eq(plan.campaign)
    end

    it 'includes the current user' do
      context = service.send(:prompt_template_context)

      expect(context[:user]).to eq(user)
    end
  end

  describe '#assistant_context' do
    let(:service) { described_class.new(plan, user, instructions, options) }

    context 'when assistant has assessment dependency configured' do
      let!(:campaign_idp) { create(:campaign_idp, campaign: campaign, idp_template: idp_template) }
      let!(:assessment) { create(:assessment) }
      let!(:question) { create(:question, assessment: assessment) }
      let!(:campaign_idp_dependency) do
        create(:campaign_idp_dependency, campaign_idp: campaign_idp, dependency: question)
      end

      before do
        ai_assistant.update!(dependencies: ['assessments'])
      end

      it 'includes parsed assessment dependency in context' do
        parsed_assessment_data = '<assessment>Sample parsed assessment data</assessment>'
        allow_any_instance_of(AI::Utils::DependencyParser::Assessment).to receive(:parse).
          and_return(parsed_assessment_data)

        context = service.send(:assistant_context)

        expect(context).to include(parsed_assessment_data)
      end
    end

    context 'when assistant does not have assessment dependency' do
      before do
        ai_assistant.update!(dependencies: [])
      end

      it 'does not include assessment dependency in context' do
        context = service.send(:assistant_context)

        expect(context).not_to include('<assessment>')
      end
    end
  end
end
