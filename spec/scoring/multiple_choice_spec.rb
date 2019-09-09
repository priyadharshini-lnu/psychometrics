# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Scoring::MultipleChoice do
  let!(:multiple_choice) { Scoring::MultipleChoice.new }
  let!(:template_data) do
    [
      { 'index' => 0, 'value' => 2 },
      { 'index' => 1, 'value' => 3 }, { 'index' => 2, 'value' => 4 }
    ]
  end

  describe '#calculate' do
    context 'when scoring: choice #1 - 2, choice #2 - 3, choice #3 - 4' do
      context 'when answer: #1' do
        it 'returns 2' do
          result = multiple_choice.
                   calculate(Question.new, { 'answers' => [{ 'index' => 0, 'value' => true }] }, template_data)[:value]
          expect(result).to eq(2)
        end
      end
      context 'when answer: #1, #3' do
        it 'returns 3' do
          result = multiple_choice.
                   calculate(Question.new, {
                     'answers' => [{ 'index' => 0, 'value' => true }, { 'index' => 2, 'value' => true }]
                   }, template_data)[:value]
          expect(result).to eq(3)
        end
      end
      context 'when no answer' do
        it 'returns nil' do
          result = multiple_choice.calculate(Question.new, { 'answers' => [] }, template_data)[:value]
          expect(result).to be_nil
        end
      end
      context 'when answer: {\'index\' => 0, \'value\' => false}' do
        it 'returns nil' do
          result = multiple_choice.
                   calculate(Question.new, { 'answers' => [{ 'index' => 0, 'value' => false }] }, template_data)[:value]
          expect(result).to be_nil
        end
      end
    end

    context 'with not applicable option' do
      it 'returns 2' do
        result = multiple_choice.
                 calculate(
                   Question.new,
                   { 'answers' => [{ 'index' => 0, 'value' => true }], 'not_applicable' => false },
                   template_data
                 )[:value]
        expect(result).to eq(2)
      end

      it 'returns nil' do
        result = multiple_choice.
                 calculate(
                   Question.new,
                   { 'answers' => [{ 'index' => 0, 'value' => true }], 'not_applicable' => true },
                   template_data
                 )[:value]
        expect(result).to be_nil
      end
    end
  end
end
