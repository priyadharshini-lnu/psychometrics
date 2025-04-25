# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Scoring::TextEntry do
  let!(:slider) { Scoring::Slider.new }
  let!(:template_data) do
    [
      { 'index' => 0, 'min' => 0, 'max' => 2 },
      { 'index' => 1, 'min' => 0, 'max' => 3 },
      { 'index' => 2, 'min' => 0, 'max' => 4 }
    ]
  end
  let!(:question) { Question.new(props: { 'minValue' => 50, 'maxValue' => 200, 'choices' => 3 }) }

  describe '#calculate' do
    it 'score when template is less than answers' do
      template = [
        { 'index' => 1, 'min' => 0, 'max' => 3 }
      ]
      answers = [{ 'index' => 0, 'value' => 100 }, { 'index' => 1, 'value' => 150 }]
      result = slider.calculate(question, { 'answers' => answers }, factors_scoring(template))[:value]

      expect(result).to eq(((150 - 50) / (200 - 50).to_f * 3) / 1.to_f)
    end

    context 'when scoring: choice #1 - 2, choice #2 - 3, choice #3 - 4' do
      context 'and question props: minValue = 50, maxValue = 200' do
        context 'when answer: #1 - 100, #2, #3 - 0' do
          it 'returns 2/9' do
            result = slider.
                     calculate(question, { 'answers' => [{ 'index' => 0,
                                                           'value' => 100 }] }, factors_scoring(template_data))[:value]
            expect(result).to eq(((100 - 50) / (200 - 50).to_f * 2) / 1.to_f)
          end
        end
        context 'when answer: #1 - 100, #2, #3 - 200' do
          it 'returns 23/9' do
            result = slider.
                     calculate(question,
                               {
                                 'answers' => [
                                   { 'index' => 0, 'value' => 100 },
                                   { 'index' => 1, 'value' => 200 },
                                   { 'index' => 2, 'value' => 200 }
                                 ]
                               }, factors_scoring(template_data))[:value]
            expect(result.round(3)).to eq(
              (
                (
                  ((100 - 50) / (200 - 50).to_f * 2) +
                  ((200 - 50) / (200 - 50).to_f * 3) +
                  ((200 - 50) / (200 - 50).to_f * 4)
                ) / 3.to_f
              ).round(3)
            )
          end
        end
        context 'when empty answer' do
          it 'returns 0' do
            result = slider.calculate(question, { 'answers' => [] }, factors_scoring(template_data))[:value]
            expect(result).to eq(nil)
          end
        end
        context 'when scoring is reversed, answer: #1 - 100, #2, #3 - 200' do
          it 'returns 4/9' do
            reverse_template_data = [
              { 'index' => 0, 'min' => 2, 'max' => 0 },
              { 'index' => 1, 'min' => 3, 'max' => 0 },
              { 'index' => 2, 'min' => 4, 'max' => 0 }
            ]
            result = slider.calculate(question,
                                      { 'answers' => [
                                        { 'index' => 0, 'value' => 100 },
                                        { 'index' => 1, 'value' => 200 },
                                        { 'index' => 2, 'value' => 200 }
                                      ] }, factors_scoring(reverse_template_data))[:value]
            expect(result.round(10)).to eq((4 / 9.to_f).round(10))
          end
        end

        context 'when not_applicable answer' do
          it 'returns only applicable score' do
            result = slider.calculate(question, { 'answers' => [
              { 'index' => 0, 'value' => 150 },
              { 'index' => 1, 'value' => 200 },
              { 'index' => 2, 'value' => 200 }
            ], 'not_applicable' => { '0' => true, '2' => true } }, factors_scoring(template_data))[:value]
            expect(result).to eq(3.0)
          end
        end
      end
    end
  end

  def factors_scoring(props, strategy: nil)
    FactorsScoring.new(props: props, scoring_strategy: strategy)
  end
end
