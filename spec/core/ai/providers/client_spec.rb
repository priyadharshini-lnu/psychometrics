# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::Providers::Client do
  let(:provider_id) { 'azure-openai' }
  let(:system_prompt) { 'You are a helpful assistant' }
  let(:user_prompt) { 'Tell me about AI' }

  # Setup a real config structure that would come from Settings
  before do
    # Only stub the Settings configuration - this is configuration, not behavior
    provider_config = instance_double('ProviderConfig')
    allow(provider_config).to receive(:id).and_return('azure-openai')
    allow(provider_config).to receive(:provider).and_return('AzureOpenai')
    allow(provider_config).to receive(:api_key).and_return('test-api-key')
    allow(provider_config).to receive(:endpoint).and_return('https://test-endpoint.azure.com')
    allow(provider_config).to receive(:api_version).and_return('2023-05-15')

    allow(Settings).to receive(:ai_providers).and_return([provider_config])

    # Only stub the actual HTTP request to Azure OpenAI
    allow_any_instance_of(AI::Providers::AzureOpenai).to receive(:call!).and_return({
      success: true,
      response: 'This is a test AI response'
    })
  end

  describe '.call' do
    # To test BaseCommand integration properly, test both the
    # instance method and verify that the class method has a path to it
    it 'processes a request through the instance method' do
      # First verify that the instance method works correctly
      client = described_class.new(
        provider_id: provider_id,
        system_prompt: system_prompt,
        user_prompt: user_prompt
      )

      # Verify the instance method returns the expected response
      instance_result = client.call
      expect(instance_result).to eq('This is a test AI response')

      # Now ensure the class method exists and takes the correct parameters
      # (We can't easily test its return value directly due to BaseCommand wrapping)
      expect(described_class).to respond_to(:call)

      # For integration's sake, actually call the method to ensure it runs without errors
      described_class.call(
        provider_id: provider_id,
        system_prompt: system_prompt,
        user_prompt: user_prompt
      )

      # Success is implied by reaching this point without errors
    end
  end

  describe '#call' do
    it 'finds the provider config and generates a response' do
      # Use real objects
      client = described_class.new(
        provider_id: provider_id,
        system_prompt: system_prompt,
        user_prompt: user_prompt
      )

      result = client.call
      expect(result).to eq('This is a test AI response')
    end

    it 'raises an error when provider_id is not found' do
      client = described_class.new(
        provider_id: 'non-existent-provider',
        system_prompt: system_prompt,
        user_prompt: user_prompt
      )

      expect { client.call }.to raise_error(StandardError, /Provider configuration not found/)
    end

    it 'raises an error when the provider returns an error' do
      # Only stub the actual HTTP request to Azure OpenAI for this specific test
      allow_any_instance_of(AI::Providers::AzureOpenai).to receive(:call!).and_return({
        success: false,
        message: 'Provider error message'
      })

      client = described_class.new(
        provider_id: provider_id,
        system_prompt: system_prompt,
        user_prompt: user_prompt
      )

      expect { client.call }.to raise_error(StandardError, /AI Provider error: Provider error message/)
    end

    it 'falls back to AzureOpenai when provider class is not found' do
      # Add a config with a non-existent provider class
      provider_config = instance_double('ProviderConfig')
      allow(provider_config).to receive(:id).and_return('custom-provider')
      allow(provider_config).to receive(:provider).and_return('NonExistentProvider')
      allow(provider_config).to receive(:api_key).and_return('test-api-key')
      allow(provider_config).to receive(:endpoint).and_return('https://test-endpoint.azure.com')
      allow(provider_config).to receive(:api_version).and_return('2023-05-15')

      allow(Settings).to receive(:ai_providers).and_return([provider_config])

      client = described_class.new(
        provider_id: 'custom-provider',
        system_prompt: system_prompt,
        user_prompt: user_prompt
      )

      result = client.call
      expect(result).to eq('This is a test AI response')
    end
  end
end
