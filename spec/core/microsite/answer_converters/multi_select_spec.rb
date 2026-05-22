# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Microsite::AnswerConverters::MultiSelect do
  let(:question) { instance_double(Question, id: 123) }

  describe '.build_answers' do
    context 'with valid selections' do
      it 'converts multiple selections to index/value array' do
        result = { 'kind' => 'multi_select', 'selected' => %w[o5 o6 o7] }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([
          { 'index' => 4, 'value' => true },
          { 'index' => 5, 'value' => true },
          { 'index' => 6, 'value' => true }
        ])
      end

      it 'converts letter selections' do
        result = { 'kind' => 'multi_select', 'selected' => %w[a c] }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([
          { 'index' => 0, 'value' => true },
          { 'index' => 2, 'value' => true }
        ])
      end
    end

    context 'with single selection' do
      it 'returns array with one entry' do
        result = { 'kind' => 'multi_select', 'selected' => ['b'] }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([{ 'index' => 1, 'value' => true }])
      end
    end

    context 'with empty selections' do
      it 'returns nil for empty array' do
        result = { 'kind' => 'multi_select', 'selected' => [] }
        expect(described_class.build_answers(result, question)).to be_nil
      end

      it 'returns nil for nil' do
        result = { 'kind' => 'multi_select', 'selected' => nil }
        expect(described_class.build_answers(result, question)).to be_nil
      end
    end
  end
end
