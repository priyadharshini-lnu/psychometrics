# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::Assistants::Service do
  let!(:assistant) do
    create(:ai_assistant, provider_id: 'azure-openai', system_prompt: 'You are a helpful assistant',
   user_prompt: 'Tell me about AI')
  end

  before do
    allow(AI::Providers::Client).to receive(:call).and_return({ ok: 'This is a test AI response' })
  end

  describe '.call' do
    it 'processes a request through the instance method' do
      instance_result = described_class.call!(assistant.id)
      expect(instance_result).to eq('This is a test AI response')
      expect(described_class).to respond_to(:call)

      described_class.call(assistant.id)
    end
  end

  describe '#call' do
    it 'finds the assistant and returns the response from the client' do
      result = described_class.call!(assistant.id)

      expect(result).to eq('This is a test AI response')
    end

    it 'raises RecordNotFound when the assistant does not exist' do
      service = described_class.new('non-existent-id')

      expect { service.call }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'passes through errors from the client' do
      allow(AI::Providers::Client).to receive(:call).
        and_raise(StandardError.new('AI provider error'))

      service = described_class.new(assistant.id)

      expect { service.call }.to raise_error(StandardError, 'AI provider error')
    end
  end
end
