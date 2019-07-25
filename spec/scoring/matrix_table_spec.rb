require 'rails_helper'

RSpec.describe Scoring::MatrixTable do
  let!(:matrix_table) { Scoring::MatrixTable.new }
  let!(:template_data) { [{"scale"=>0, "choice"=>0, "value"=>1}, {"scale"=>1, "choice"=>0, "value"=>2}, {"scale"=>2, "choice"=>0, "value"=>3}, {"scale"=>0, "choice"=>2, "value"=>1}, {"scale"=>1, "choice"=>2, "value"=>2}, {"scale"=>2, "choice"=>2, "value"=>3}, {"choice"=>1, "scale"=>0, "value"=>3}, {"choice"=>1, "scale"=>1, "value"=>2}, {"choice"=>1, "scale"=>2, "value"=>1}] }

  describe '#calculate' do
    context 'when scoring: 1,2,3|3,2,1|1,2,3' do
      context 'when answer: s1c1, s2c2, s2c3' do
        it 'returns 1.3333' do
          result = matrix_table.calculate(Question.new, {'answers' => [{'scale' => 0, 'choice' => 0, 'value' => true}, {'scale' => 1, 'choice' => 1, 'value' => true}, {'scale' => 1, 'choice' => 2, 'value' => true}]}, template_data)[:value]
          expect(result).to eq(5/3.to_f)
        end
      end
      context 'when no answer' do
        it 'returns nil' do
          result = matrix_table.calculate(Question.new, {'answers' => []}, template_data)[:value]
          expect(result).to be_nil
        end
      end
      context 'when answer: {\'scale\' => 0, \'choice\' => 0, \'value\' => false}' do
        it 'returns nil' do
          result = matrix_table.calculate(Question.new, {'answers' => [{'scale' => 1, 'choice' => 1, 'value' => false}]}, template_data)[:value]
          expect(result).to be_nil
        end
      end
    end

    context 'with not applicable option' do
      context 'when answer: s1c1, no applicable, s2c3' do
        it 'returns nil' do
          result = matrix_table.calculate(Question.new, {'answers' => [{'scale' => 0, 'choice' => 0, 'value' => true}, {'scale' => 1, 'choice' => 2, 'value' => true}], 'not_applicable' => {'1' => true}}, template_data)[:value]
          expect(result).to eq(3/2.0)
        end
      end
      it 'returns nil' do
        result = matrix_table.calculate(Question.new, {'answers' => [],'not_applicable' => {'0' => true, '1' => true, '2' => true}}, template_data)[:value]
        expect(result).to be_nil
      end
    end
  end
end
