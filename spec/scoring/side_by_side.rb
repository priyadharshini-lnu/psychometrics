require 'rails_helper'

RSpec.describe Scoring::SideBySide do
  let!(:side_by_side) { Scoring::SideBySide.new }
  let!(:template_data) { [{"scale"=>0, "choice"=>0, "values"=>[{"index"=>0, "value"=>1}, {"index"=>1, "value"=>6}]}, {"scale"=>1, "choice"=>0, "values"=>[{"index"=>0, "value"=>1}, {"index"=>1, "value"=>2}]}, {"scale"=>0, "choice"=>1, "values"=>[{"index"=>0, "value"=>1}, {"index"=>1, "value"=>6}]}, {"scale"=>1, "choice"=>1, "values"=>[{"index"=>0, "value"=>1}, {"index"=>1, "value"=>2}]}, {"scale"=>0, "choice"=>2, "values"=>[{"index"=>0, "value"=>1}, {"index"=>1, "value"=>6}]}, {"scale"=>1, "choice"=>2, "values"=>[{"index"=>0, "value"=>1}, {"index"=>1, "value"=>2}]}] }

  describe '#calculate' do
    context 'when scoring is ... (show template data)' do
      context 'when answer: s0c0i1, s1c2i0, s1c2i1' do
        it 'returns 1.3333' do
          result = side_by_side.calculate(Question.new, {'answers' => [{'scale' => 0, 'choice' => 0, 'values' => [{'index' => 1, 'value' => true}]}, {'scale' => 1, 'choice' => 2, 'values' => [{'index' => 0, 'value' => true}, {'index' => 1, 'value' => true}]}]}, template_data)
          expect(result).to eq(3)
        end
      end
      context 'when no answer' do
        it 'returns nil' do
          result = side_by_side.calculate(Question.new, {'answers' => []}, template_data)
          expect(result).to be_nil
        end
      end
      context 'when answer: {\'scale\' => 0, \'choice\' => 0, \'values\' => []}' do
        it 'returns nil' do
          result = side_by_side.calculate(Question.new, {'answers' => [{'scale' => 1, 'choice' => 1, 'values' => []}]}, template_data)
          expect(result).to be_nil
        end
      end
    end
  end
end
