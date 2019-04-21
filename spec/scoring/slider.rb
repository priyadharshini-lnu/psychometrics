require 'rails_helper'

RSpec.describe Scoring::TextEntry do
  let!(:slider) { Scoring::Slider.new }
  let!(:template_data) { [{'index' => 0, 'value' => 2}, {'index' => 1, 'value' => 3}, {'index' => 2, 'value' => 4}] }
  let!(:question) { Question.new(props: {'minValue' => 50, 'maxValue' => 200, 'choices' => 3}) }

  describe '#calculate' do
    context 'when scoring: choice #1 - 2, choice #2 - 3, choice #3 - 4' do
      context 'and question props: minValue = 50, maxValue = 200' do
        context 'when answer: #1 - 100, #2, #3 - 0' do
          it 'returns 2/9' do
            result = slider.calculate(question, {'answers' => [{"index" => 0, "value" => 100}]}, template_data)
            expect(result).to eq(2/9.to_f)
          end
        end
        context 'when answer: #1 - 100, #2, #3 - 200' do
          it 'returns 23/9' do
            result = slider.calculate(question, {'answers' => [{"index" => 0, "value" => 100}, {"index" => 1, "value" => 200}, {"index" => 2, "value" => 200}]}, template_data)
            expect(result).to eq(23/9.to_f)
          end
        end
        context 'when empty answer' do
          it 'returns 0' do
            result = slider.calculate(question, {'answers' => []}, template_data)
            expect(result).to eq(0)
          end
        end
        context 'when scoring is reversed, answer: #1 - 100, #2, #3 - 200' do
          it 'returns 4/9' do
            reverse_template_data = [{'index' => 0, 'value' => 2, 'reverse' => true}, {'index' => 1, 'value' => 3, 'reverse' => true}, {'index' => 2, 'value' => 4, 'reverse' => true}]
            result = slider.calculate(question, {'answers' => [{'index' => 0, 'value' => 100}, {'index' => 1, 'value' => 200}, {'index' => 2, 'value' => 200}]}, reverse_template_data)
            expect(result.round(10)).to eq((4 / 9.to_f).round(10))
          end
        end
      end
    end
  end
end
