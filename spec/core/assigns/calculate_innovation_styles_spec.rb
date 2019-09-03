require 'rails_helper'

describe Assigns::CalculateInnovationStyles do
  let(:assign) { create(:assign) }
  let(:dimension) { assign.assessment.dimension }
  let(:factor1) { create(:factor, dimension: dimension) }
  let(:factor2) { create(:factor, dimension: dimension) }
  let(:factor3) { create(:factor, dimension: dimension) }

  # InnovationStyle and InnovationStylesFactor #1
  let(:innovation_style1) { create(:innovation_style, dimension: dimension) }
  let(:innovation_styles_factor1_1) { create(:innovation_styles_factor, innovation_style: innovation_style1, factor: factor1) }
  let(:innovation_styles_factor1_2) { create(:innovation_styles_factor, innovation_style: innovation_style1, factor: factor2) }
  let(:innovation_styles_factor1_3) { create(:innovation_styles_factor, innovation_style: innovation_style1, factor: factor1, predicate: 'greater_then', value: 4.0, weight: 0.5) }
  let(:innovation_styles_factor1_4) { create(:innovation_styles_factor, innovation_style: innovation_style1, factor: factor2, predicate: 'greater_then', value: 3.0) }

  # InnovationStyle and InnovationStylesFactor #2
  let(:innovation_style2) { create(:innovation_style, dimension: dimension) }
  let(:innovation_styles_factor2_1) { create(:innovation_styles_factor, innovation_style: innovation_style2, factor: factor1) }

  it '.call!' do
    expect(described_class).to respond_to(:'call!').with_unlimited_arguments
  end

  context '#condition_valid?' do
    context 'equal_to' do
      let(:predicate) { 'equal_to' }

      it 'pass' do
        result = described_class.new(assign).send(:condition_valid?, innovation_styles_factor1_1, 3.0)
        expect(result).to be_truthy
      end

      it 'not pass' do
        result = described_class.new(assign).send(:condition_valid?, innovation_styles_factor1_1, 6.0)
        expect(result).to be_falsy
      end
    end
  end

  context '.call' do
    it 'calculates innovation_style score' do
      scoring = {
        "#{innovation_styles_factor1_1.factor.id}" => {
          'results' => [
            {
              value: 4.0
            },
            {
              value: 2.0
            }
          ]
        },
        "#{innovation_styles_factor1_2.factor.id}" => {
          'results' => [
            {
              value: 3.0
            },
            {
              value: 5.0
            }
          ]
        },
      }
      assign.scoring = scoring
      result = described_class.call!(assign)
      expect(result.first[:factor_ids]).to eq([innovation_styles_factor1_1.factor.id])
      expect(result.first[:value]).to eq(50)
    end
    it 'calculates weighted innovation_style score' do
      scoring = {
        "#{innovation_styles_factor1_3.factor.id}" => {
          'results' => [
            {
              value: 4.0
            },
            {
              value: 2.0
            }
          ]
        },
        "#{innovation_styles_factor1_4.factor.id}" => {
          'results' => [
            {
              value: 3.0
            },
            {
              value: 5.0
            }
          ]
        },
      }  
      assign.scoring = scoring
      result = described_class.call!(assign)
      expect(result.first[:factor_ids]).to eq([innovation_styles_factor1_4.factor.id])
      expect(result.first[:value]).to eq((1/1.5).round(2) * 100)
    end
  end
end
