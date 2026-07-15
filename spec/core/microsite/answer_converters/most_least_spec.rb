# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Microsite::AnswerConverters::MostLeast do
  let(:question) { instance_double(Question, id: 123) }

  describe 'mapping question responses' do
    context 'with valid most and least' do
      it 'converts letter options to scale/value/choice format' do
        result = { 'kind' => 'most_least', 'most' => 'a', 'least' => 'b' }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([
          { 'scale' => 0, 'value' => 0, 'choice' => 0 },
          { 'scale' => 1, 'value' => 0, 'choice' => 1 }
        ])
      end

      it 'uses scale 0 for most and scale 1 for least' do
        result = { 'kind' => 'most_least', 'most' => 'c', 'least' => 'd' }
        answers = described_class.build_answers(result, question)

        expect(answers).to eq([
          { 'scale' => 0, 'value' => 0, 'choice' => 2 },
          { 'scale' => 1, 'value' => 0, 'choice' => 3 }
        ])
      end
    end

    context 'with blank values' do
      it 'returns nil when most is blank' do
        result = { 'kind' => 'most_least', 'most' => nil, 'least' => 'b' }
        expect(described_class.build_answers(result, question)).to be_nil
      end

      it 'returns nil when least is blank' do
        result = { 'kind' => 'most_least', 'most' => 'a', 'least' => nil }
        expect(described_class.build_answers(result, question)).to be_nil
      end
    end
  end
end
