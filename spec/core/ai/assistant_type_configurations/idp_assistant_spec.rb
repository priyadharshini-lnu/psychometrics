# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::AssistantTypeConfigurations::IdpAssistant do
  let(:assistant) { build(:assistant, assistant_type: 'idp_assistant') }
  let(:ai_provider_config) do
    {
      'model_id' => model_id,
      'model' => model_id,
      'name' => 'Test Model',
      'context' => {}
    }
  end
  let(:idp_assistant) { described_class.new(assistant) }

  before do
    allow(Settings).to receive(:ai_providers).and_return([ai_provider_config])
    allow(assistant).to receive(:ai_provider_for_model).and_return(ai_provider_config)
  end

  describe '#output_schema_as_context' do
    let(:mock_schema_class) { double('SchemaClass') }
    let(:mock_context) { 'mock schema context' }
    let(:mock_as_context) { 'mock as_context output' }

    before do
      allow(idp_assistant).to receive(:output_schema_class).and_return(mock_schema_class)
      allow(idp_assistant).to receive(:has_ruby_llm_schema?).and_return(true)
      allow(mock_schema_class).to receive(:context).and_return(mock_context)
      allow(mock_schema_class).to receive(:as_context).and_return(mock_as_context)
    end

    context 'when model is cohere.command-a (unsupported structured output with tools)' do
      let(:model_id) { 'cohere.command-a' }

      it 'calls the parent method which uses context' do
        result = idp_assistant.output_schema_as_context

        expect(result).to eq(mock_as_context)
        expect(mock_schema_class).not_to have_received(:context)
        expect(mock_schema_class).to have_received(:as_context)
      end
    end

    context 'when model supports structured output' do
      let(:model_id) { 'gpt-4o-mini' }

      it 'calls as_context on the schema class' do
        result = idp_assistant.output_schema_as_context

        expect(result).to eq(mock_context)
        expect(mock_schema_class).not_to have_received(:as_context)
        expect(mock_schema_class).to have_received(:context)
      end
    end
  end
end
