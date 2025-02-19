# frozen_string_literal: true

require 'rails_helper'

describe DeploymentActions::GenerativeService do
  let(:skill) { create(:skill) }
  let(:generated_actions) do
    [
      {
        'description' => 'Enroll in an online course designed to build expertise in advanced JavaScript concepts...',
        'learning_style' => 'structured_learning'
      },
      {
        'description' => "Join a team-focused activity where you review peers'...",
        'learning_style' => 'learning_from_the_others'
      }
    ]
  end

  let(:service_instance) { instance_double(DeploymentActions::Services::AzureOpenai) }
  let(:options) { {} }

  before do
    allow(Settings).to receive(:generative_ai_service).and_return('azure_openai')
  end

  describe '#initialize' do
    context 'when service is configured' do
      it 'initializes with valid service' do
        service = described_class.new(skill, options)
        expect(service.service).to eq(DeploymentActions::Services::AzureOpenai)
      end
    end

    context 'when service is not configured' do
      before do
        allow(Settings).to receive(:generative_ai_service).and_return(nil)
      end

      it 'raises ServiceNotConfiguredError' do
        expect { described_class.new(skill, options) }.to raise_error(
          DeploymentActions::GenerativeService::ServiceNotConfiguredError,
          'Generative AI service not configured'
        )
      end
    end

    context 'when service is not supported' do
      before do
        allow(Settings).to receive(:generative_ai_service).and_return('unsupported_service')
      end

      it 'raises UnsupportedServiceError' do
        expect { described_class.new(skill, options) }.to raise_error(
          DeploymentActions::GenerativeService::UnsupportedServiceError,
          'Unsupported service: unsupported_service'
        )
      end
    end
  end

  describe '#call!' do
    let(:service) { described_class.new(skill, options) }

    before do
      allow(DeploymentActions::Services::AzureOpenai).to receive(:new).and_return(service_instance)
      allow(service_instance).to receive(:generate!).and_return('Generated content')
      allow(service).to receive(:system_prompt).and_return('System prompt')
      allow(service).to receive(:build_prompt).and_return('User prompt')
    end

    context 'when generating for the first time' do
      it 'calls the service with correct prompts' do
        expect(DeploymentActions::Services::AzureOpenai).to receive(:new).with('System prompt', 'User prompt')
        service.call!
      end

      it 'returns generated content' do
        expect(service.call!).to eq('Generated content')
      end
    end

    context 'when regenerating content' do
      let(:options) { { generate_more: true, generated_actions: generated_actions } }

      context 'when within regeneration limit' do
        it 'generates new content' do
          expect(service.call!).to eq('Generated content')
        end
      end

      context 'when regeneration limit is reached' do
        let(:max_actions) { described_class::MAX_REGENERATIONS * 7 }
        let(:options) do
          {
            generate_more: true,
            generated_actions: Array.new(max_actions) { generated_actions.first }
          }
        end

        it 'raises RegenerateLimitReachedError' do
          expect { service.call! }.to raise_error(
            DeploymentActions::GenerativeService::RegenerateLimitReachedError
          )
        end
      end
    end
  end
end
