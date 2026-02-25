# frozen_string_literal: true

require 'rails_helper'

describe AI::CampaignArtifacts::ResultGenerator do
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

  shared_context 'assistant chat setup' do
    let(:assistant_chat) { create(:assistant_chat, ai_assistant: ai_assistant, user: current_user) }

    before do
      allow(ai_assistant).to receive(:for_user).and_return(assistant_chat)
      allow(assistant_chat).to receive(:with_tools).and_return(assistant_chat)
    end
  end

  describe '#call' do
    context 'when force_regenerate is not passed (defaults to true)' do
      include_context 'assistant chat setup'

      it 'uses default force_regenerate value and triggers service class' do
        assistant_service_instance = instance_double(AI::AssistantService)
        allow(AI::AssistantService).to receive(:new).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:on).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:call)

        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).and_return('parsed dependencies')

        generator = described_class.new(ai_artifact, user, { current_user: current_user })

        expect(generator.send(:force_regenerate)).to be true

        generator.call

        expect(assistant_service_instance).to have_received(:call)
      end
    end

    context 'when force_regenerate is false and dependencies have not changed' do
      include_context 'assistant chat setup'

      let!(:ai_artifact_result) do
        create(
          :campaign_ai_artifact_result,
          campaign_ai_artifact: ai_artifact,
          user: user,
          results: { 'summary' => 'existing summary', 'feedback' => 'existing feedback' },
          parsed_dependencies: 'parsed dependencies'
        )
      end

      it 'does not trigger the service class when dependencies are unchanged' do
        assistant_service_instance = instance_double(AI::AssistantService)
        allow(AI::AssistantService).to receive(:new).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:on).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:call)

        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).and_return('parsed dependencies')

        result = described_class.call(ai_artifact, user, { force_regenerate: false, current_user: current_user })

        expect(result[:ok]).to be_present
        expect(AI::AssistantService).not_to have_received(:new)
      end

      it 'triggers service class when schema keys are changed' do
        assistant_service_instance = instance_double(AI::AssistantService)
        allow(AI::AssistantService).to receive(:new).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:on).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:call)

        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).and_return('parsed dependencies')

        # Change the schema keys by adding a new one
        ai_assistant.assistant_output_schema_keys.create!(key: 'new_key')
        generator = described_class.new(ai_artifact.reload, user,
                                        { force_regenerate: false, current_user: current_user })

        generator.call

        expect(assistant_service_instance).to have_received(:call)
      end

      it 'triggers service class when parsed dependencies are changed' do
        assistant_service_instance = instance_double(AI::AssistantService)
        allow(AI::AssistantService).to receive(:new).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:on).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:call)

        # Mock different parsed dependencies
        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).
          and_return('new parsed dependencies')

        generator = described_class.new(ai_artifact, user, { force_regenerate: false, current_user: current_user })

        generator.call

        expect(assistant_service_instance).to have_received(:call)
      end

      it 'triggers service class when artifact result has error even if dependencies are unchanged' do
        # Add error to the existing artifact result
        ai_artifact_result.update!(error: 'Previous generation failed')

        assistant_service_instance = instance_double(AI::AssistantService)
        allow(AI::AssistantService).to receive(:new).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:on).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:call)

        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).and_return('parsed dependencies')

        generator = described_class.new(ai_artifact, user, { force_regenerate: false, current_user: current_user })

        generator.call

        expect(assistant_service_instance).to have_received(:call)
      end
    end

    context 'when force_regenerate is true' do
      include_context 'assistant chat setup'

      let!(:ai_artifact_result) do
        create(
          :campaign_ai_artifact_result,
          campaign_ai_artifact: ai_artifact,
          user: user,
          results: { 'summary' => 'existing summary', 'feedback' => 'existing feedback' },
          parsed_dependencies: 'parsed dependencies'
        )
      end

      it 'triggers service class even when dependencies are unchanged' do
        assistant_service_instance = instance_double(AI::AssistantService)
        allow(AI::AssistantService).to receive(:new).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:on).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:call)

        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).and_return('parsed dependencies')

        generator = described_class.new(ai_artifact, user, { force_regenerate: true, current_user: current_user })

        generator.call

        expect(assistant_service_instance).to have_received(:call)
      end
    end

    context 'in test mode' do
      include_context 'assistant chat setup'

      let(:test_data) { 'test data content' }
      let(:options) { { test_mode: true, test_data: test_data, current_user: current_user } }

      before do
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: 'assistant response without tool' })
      end

      it 'works with nil user as used in test generation' do
        parser_instance = spy('AI::Utils::CampaignArtifactParser')
        allow(AI::Utils::CampaignArtifactParser).to receive(:new).and_return(parser_instance)

        generator = described_class.new(ai_artifact, nil, options)

        expect { generator.call }.not_to raise_error

        expect(parser_instance).not_to have_received(:call!)
      end

      it 'does not trigger AI::Utils::CampaignArtifactParser call! method' do
        parser_instance = spy('AI::Utils::CampaignArtifactParser')
        allow(AI::Utils::CampaignArtifactParser).to receive(:new).and_return(parser_instance)

        generator = described_class.new(ai_artifact, nil, options)

        generator.call

        expect(parser_instance).not_to have_received(:call!)
      end

      it 'uses test data in parsed dependencies' do
        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:parse_campaign_instructions).
          and_return('artifact context')

        generator = described_class.new(ai_artifact, nil, options)

        parsed_deps = generator.send(:parsed_dependencies)

        expect(parsed_deps).to include('artifact context')
        expect(parsed_deps).to include('<test_parsed_data>')
        expect(parsed_deps).to include('test data content')
        expect(parsed_deps).to include('</test_parsed_data>')
      end

      it 'does not save errors to artifact result in test mode' do
        stub_wisper_publisher('AI::AssistantService', :call, :error, 'test error')

        generator = described_class.new(ai_artifact, nil, options)

        # Ensure no artifact result exists
        expect(ai_artifact.results.where(user: nil)).to be_empty

        generator.call

        # Should still not create/save artifact result in test mode
        expect(ai_artifact.results.where(user: nil)).to be_empty
      end

      it 'does not attempt to update campaign_user when user is nil' do
        generator = described_class.new(ai_artifact, nil, options)

        # This should not raise an error even though user is nil
        expect { generator.call }.not_to raise_error
      end
    end

    context 'in non-test mode' do
      include_context 'assistant chat setup'

      it 'triggers AI::Utils::CampaignArtifactParser call! method' do
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: 'success' })
        parser_instance = instance_double(AI::Utils::CampaignArtifactParser)
        allow(AI::Utils::CampaignArtifactParser).to receive(:new).and_return(parser_instance)
        allow(parser_instance).to receive(:call!).and_return('parsed dependencies')

        generator = described_class.new(ai_artifact, user, { current_user: current_user })

        generator.call

        expect(parser_instance).to have_received(:call!)
      end

      it 'saves errors to the result record when service fails' do
        error_message = 'service error message'
        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).and_return('parsed dependencies')
        stub_wisper_publisher('AI::AssistantService', :call, :error, error_message, StandardError.new(error_message))

        generator = described_class.new(ai_artifact, user, { current_user: current_user })

        generator.call

        artifact_result = ai_artifact.results.find_by(user: user)
        expect(artifact_result).to be_present
        expect(artifact_result.error).to eq(error_message)
      end

      it 'saves errors when assistant returns ok but no tool was used' do
        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).and_return('parsed dependencies')
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: 'assistant response without tool' })

        described_class.call(ai_artifact, user, { current_user: current_user })

        artifact_result = ai_artifact.results.find_by(user: user)
        expect(artifact_result).to be_present
        expect(artifact_result.error).to eq('assistant response without tool')
      end

      it 'handles SuccessfulCompletionSignal exception correctly' do
        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).and_return('parsed dependencies')

        successful_data = { 'summary' => 'AI generated summary', 'feedback' => 'AI generated feedback' }
        signal = AI::Utils::SuccessfulCompletionSignal.new('Error', data: successful_data)

        # Mock the specific instance that will be created
        assistant_service_instance = instance_double(AI::AssistantService)
        allow(AI::AssistantService).to receive(:new).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:on).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:call).and_raise(signal)

        result = described_class.call(ai_artifact, user, { current_user: current_user })

        expect(result[:ok]).to include(results: successful_data)
        expect(result[:ok]).to include(parsed_dependencies: 'parsed dependencies')
      end

      it 'handles parser errors correctly' do
        parser_error = AI::Utils::CampaignArtifactParser::Error.new('parsing failed')
        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).and_raise(parser_error)

        described_class.call(ai_artifact, user, { current_user: current_user })

        artifact_result = ai_artifact.results.find_by(user: user)
        expect(artifact_result).to be_present
        expect(artifact_result.error).to eq('parsing failed')
      end
    end

    context 'with current_user provided' do
      include_context 'assistant chat setup'

      it 'uses provided current_user in service call' do
        assistant_service_instance = instance_double(AI::AssistantService)
        allow(AI::AssistantService).to receive(:new).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:on).and_return(assistant_service_instance)
        allow(assistant_service_instance).to receive(:call)

        allow_any_instance_of(AI::Utils::CampaignArtifactParser).to receive(:call!).and_return('parsed dependencies')

        generator = described_class.new(ai_artifact, user, { current_user: current_user })

        generator.call

        expect(AI::AssistantService).to have_received(:new).with(
          ai_assistant.id,
          current_user,
          'parsed dependencies',
          chat: anything
        )
      end
    end
  end
end
