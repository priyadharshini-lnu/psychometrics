# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::AssistantTypeConfigurations::Base do
  # Use a concrete subclass to exercise the Base behaviour without coupling to a specific type
  let(:concrete_class) do
    Class.new(described_class) do
      def base_params
        { temperature: 0.5, max_tokens: 2000 }
      end

      def validate_type_specific_rules
        []
      end
    end
  end

  let(:assistant) { build(:assistant, model_params: {}) }
  let(:base_provider_config) do
    { 'model_id' => 'gpt-4o', 'model' => 'gpt-4o', 'name' => 'GPT-4o', 'context' => {} }
  end
  let(:subject) { concrete_class.new(assistant) }

  before do
    allow(Settings).to receive(:ai_providers).and_return([base_provider_config])
    allow(assistant).to receive(:ai_provider_for_model).and_return(base_provider_config)
  end

  describe '#default_params' do
    context 'when model_params is empty' do
      it 'returns the type-level base_params unchanged' do
        expect(subject.default_params).to eq(temperature: 0.5, max_tokens: 2000)
      end
    end

    context 'when model_params sets max_tokens' do
      before { assistant.model_params = { 'max_tokens' => 6000 } }

      it 'overrides the type-level max_tokens with the DB value' do
        expect(subject.default_params[:max_tokens]).to eq(6000)
      end

      it 'keeps other type-level params intact' do
        expect(subject.default_params[:temperature]).to eq(0.5)
      end
    end

    context 'when model_params sets temperature' do
      before { assistant.model_params = { 'temperature' => 0.9 } }

      it 'overrides the type-level temperature with the DB value' do
        expect(subject.default_params[:temperature]).to eq(0.9)
      end
    end

    context 'when model uses max_completion_tokens (capabilities.uses_completion_tokens: true)' do
      let(:base_provider_config) do
        {
          'model_id' => 'gpt-5-mini', 'model' => 'gpt-5-mini', 'name' => 'GPT-5 Mini',
          'context' => {},
          'capabilities' => { 'uses_completion_tokens' => true, 'supports_temperature' => false }
        }
      end

      it 'renames max_tokens to max_completion_tokens' do
        expect(subject.default_params).to have_key(:max_completion_tokens)
        expect(subject.default_params).not_to have_key(:max_tokens)
      end

      it 'strips temperature since the model does not support it' do
        expect(subject.default_params).not_to have_key(:temperature)
      end

      context 'when DB overrides max_tokens' do
        before { assistant.model_params = { 'max_tokens' => 8000 } }

        it 'still renames to max_completion_tokens and uses the DB value' do
          expect(subject.default_params[:max_completion_tokens]).to eq(8000)
        end
      end

      context 'when DB sets temperature on a model that does not support it' do
        before { assistant.model_params = { 'temperature' => 0.7 } }

        it 'strips temperature regardless of the DB value' do
          expect(subject.default_params).not_to have_key(:temperature)
        end
      end
    end

    context 'when model does not support temperature (supports_temperature: false)' do
      let(:base_provider_config) do
        {
          'model_id' => 'o3', 'model' => 'o3', 'name' => 'O3', 'context' => {},
          'capabilities' => { 'supports_temperature' => false }
        }
      end

      it 'strips temperature from the type-level defaults' do
        expect(subject.default_params).not_to have_key(:temperature)
      end

      context 'when DB also sets temperature' do
        before { assistant.model_params = { 'temperature' => 0.3 } }

        it 'strips the DB temperature value too' do
          expect(subject.default_params).not_to have_key(:temperature)
        end
      end
    end
  end

  describe '#db_params' do
    context 'when model_params is empty' do
      it 'returns an empty hash' do
        expect(subject.db_params).to eq({})
      end
    end

    context 'when model_params contains max_tokens and temperature' do
      before { assistant.model_params = { 'max_tokens' => 4000, 'temperature' => 0.2 } }

      it 'returns only the overrideable DB params' do
        expect(subject.db_params).to eq(max_tokens: 4000, temperature: 0.2)
      end

      it 'does not include type-level base_params' do
        expect(subject.db_params.keys).not_to include(:response_format, :parallel_tool_calls)
      end
    end

    context 'when model uses max_completion_tokens' do
      let(:base_provider_config) do
        {
          'model_id' => 'gpt-5', 'model' => 'gpt-5', 'name' => 'GPT-5', 'context' => {},
          'capabilities' => { 'uses_completion_tokens' => true, 'supports_temperature' => false }
        }
      end

      before { assistant.model_params = { 'max_tokens' => 5000 } }

      it 'renames the DB max_tokens to max_completion_tokens' do
        expect(subject.db_params).to eq(max_completion_tokens: 5000)
      end
    end

    context 'when model does not support temperature' do
      let(:base_provider_config) do
        {
          'model_id' => 'o3', 'model' => 'o3', 'name' => 'O3', 'context' => {},
          'capabilities' => { 'supports_temperature' => false }
        }
      end

      before { assistant.model_params = { 'temperature' => 0.5 } }

      it 'strips the DB temperature' do
        expect(subject.db_params).not_to have_key(:temperature)
      end
    end
  end
end
