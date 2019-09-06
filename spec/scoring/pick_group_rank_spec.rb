require 'rails_helper'

RSpec.describe Scoring::PickGroupRank do
  let!(:pick_group_rank) { Scoring::PickGroupRank.new }
  let!(:question) { Question.new(props: {scalePoints: 3}) }
  let!(:template_data) { [{'index' => 0, 'value' => 2}, {'index' => 1, 'value' => 3}, {'index' => 2, 'value' => 4}, {'index' => 3, 'value' => 4}] }

  describe '#calculate' do
    context 'when scoring: choice #1 - 2, choice #2 - 3, choice #3 - 4' do
      context 'when answer: {scale: 0, choice: 0}, {scale: 0, choice: 3}, {scale: 1, choice: 1}, {scale: 2, choice: 2}' do
        it 'returns [2, 3, 4]' do
          result = pick_group_rank.calculate(question, {'answers' => [{'scale' => 0, 'choice' => 0}, {'scale' => 0, 'choice' =>3}, {'scale' => 1, 'choice' => 1}, {'scale' => 2, 'choice' => 2}]}, template_data)[:value]
          expect(result).to eq([3, 3, 4])
        end
      end
      context 'when answer: {scale: 2, choice: 0}' do
        it 'returns [0, 0, 2]' do
          result = pick_group_rank.calculate(question, {'answers' => [{'scale' => 2, 'choice' => 0}]}, template_data)[:value]
          expect(result).to eq([0, 0, 2])
        end
      end
      context 'when no answer' do
        it 'returns [0, 0, 0]' do
          result = pick_group_rank.calculate(question, {'answers' => []}, template_data)[:value]
          expect(result).to eq([0, 0, 0])
        end
      end
    end
  end
end
