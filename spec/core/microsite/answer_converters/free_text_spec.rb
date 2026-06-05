# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Microsite::AnswerConverters::FreeText do
  let(:question) { instance_double(Question, id: 123) }

  describe '.build_answers' do
    context 'with valid text' do
      it 'converts text to index 0 with text value' do
        result = { 'kind' => 'free_text', 'text' => 'My answer is here' }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([{ 'index' => 0, 'value' => 'My answer is here' }])
      end

      it 'preserves multiline text' do
        result = { 'kind' => 'free_text', 'text' => "Line 1\nLine 2\nLine 3" }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([{ 'index' => 0, 'value' => "Line 1\nLine 2\nLine 3" }])
      end
    end

    context 'with blank text' do
      it 'returns nil for empty string' do
        result = { 'kind' => 'free_text', 'text' => '' }
        expect(described_class.build_answers(result, question)).to be_nil
      end

      it 'returns nil for nil text' do
        result = { 'kind' => 'free_text', 'text' => nil }
        expect(described_class.build_answers(result, question)).to be_nil
      end

      it 'returns nil for whitespace only' do
        result = { 'kind' => 'free_text', 'text' => '   ' }
        expect(described_class.build_answers(result, question)).to be_nil
      end
    end
  end
end
