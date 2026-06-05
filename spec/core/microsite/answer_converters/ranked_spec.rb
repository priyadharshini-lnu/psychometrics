# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Microsite::AnswerConverters::Ranked do
  let(:question) { instance_double(Question, id: 123) }

  describe '.build_answers' do
    context 'with valid order' do
      it 'converts ranked order to 0-based index/value pairs' do
        result = { 'kind' => 'ranked', 'order' => %w[opt-1 opt-2 opt-3 opt-4] }
        answers = described_class.build_answers(result, question)

        # opt-1 is at position 0 (rank 0), opt-2 at position 1 (rank 1), etc.
        expect(answers).to eq([
          { 'index' => 0, 'value' => 0 },
          { 'index' => 1, 'value' => 1 },
          { 'index' => 2, 'value' => 2 },
          { 'index' => 3, 'value' => 3 }
        ])
      end

      it 'handles reordered options' do
        # User ranked opt-3 first, opt-1 second, opt-4 third, opt-2 fourth
        result = { 'kind' => 'ranked', 'order' => %w[opt-3 opt-1 opt-4 opt-2] }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([
          { 'index' => 2, 'value' => 0 }, # opt-3 ranked first (0)
          { 'index' => 0, 'value' => 1 }, # opt-1 ranked second (1)
          { 'index' => 3, 'value' => 2 }, # opt-4 ranked third (2)
          { 'index' => 1, 'value' => 3 }  # opt-2 ranked fourth (3)
        ])
      end

      it 'handles letter-based options' do
        result = { 'kind' => 'ranked', 'order' => %w[c a b] }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([
          { 'index' => 2, 'value' => 0 }, # c ranked first
          { 'index' => 0, 'value' => 1 }, # a ranked second
          { 'index' => 1, 'value' => 2 }  # b ranked third
        ])
      end
    end

    context 'with empty order' do
      it 'returns nil for empty array' do
        result = { 'kind' => 'ranked', 'order' => [] }
        expect(described_class.build_answers(result, question)).to be_nil
      end

      it 'returns nil for nil' do
        result = { 'kind' => 'ranked', 'order' => nil }
        expect(described_class.build_answers(result, question)).to be_nil
      end
    end
  end
end
