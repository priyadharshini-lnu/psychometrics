# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Microsite::AnswerConverters::SingleChoice do
  let(:question) { instance_double(Question, id: 123) }

  describe '.build_answers' do
    context 'with valid selection' do
      it 'converts letter selection to index/value format' do
        result = { 'kind' => 'single_choice', 'selected' => 'd' }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([{ 'index' => 3, 'value' => true }])
      end

      it 'converts o-prefix selection' do
        result = { 'kind' => 'single_choice', 'selected' => 'o2' }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([{ 'index' => 1, 'value' => true }])
      end
    end

    context 'with blank selection' do
      it 'returns nil' do
        result = { 'kind' => 'single_choice', 'selected' => '' }
        expect(described_class.build_answers(result, question)).to be_nil
      end

      it 'returns nil when selected is nil' do
        result = { 'kind' => 'single_choice', 'selected' => nil }
        expect(described_class.build_answers(result, question)).to be_nil
      end
    end
  end
end
