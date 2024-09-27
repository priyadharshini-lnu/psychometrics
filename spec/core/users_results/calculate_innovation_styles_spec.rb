# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::CalculateInnovationStyles do
  let(:users_result) { create(:users_result) }
  let(:dimension) { users_result.assessment.dimension }
  let(:first_factor) { create(:factor, dimension: dimension) }
  let(:second_factor) { create(:factor, dimension: dimension) }
  let(:third_factor) { create(:factor, dimension: dimension) }

  # InnovationStyle and InnovationStylesFactor #1
  let(:innovation_style_one) { create(:innovation_style, dimension: dimension) }
  let(:innovation_styles_first_factor_one) do
    create(:innovation_styles_factor, innovation_style: innovation_style_one,
                                             factor: first_factor)
  end
  let(:innovation_styles_first_factor_two) do
    create(:innovation_styles_factor, innovation_style: innovation_style_one,
                                             factor: second_factor)
  end
  let(:innovation_styles_first_factor_three) do
    create(:innovation_styles_factor, innovation_style: innovation_style_one,
                                             factor: first_factor, predicate: 'greater_then', value: 4.0, weight: 0.5)
  end
  let(:innovation_styles_first_factor_four) do
    create(:innovation_styles_factor, innovation_style: innovation_style_one,
                                             factor: second_factor, predicate: 'greater_then', value: 3.0)
  end

  # InnovationStyle and InnovationStylesFactor #2
  let(:innovation_style_two) { create(:innovation_style, dimension: dimension) }
  let(:innovation_styles_second_factor_one) do
    create(:innovation_styles_factor, innovation_style:
    innovation_style_two, factor: first_factor)
  end

  it '.call!' do
    expect(described_class).to respond_to(:call!).with_unlimited_arguments
  end

  context '#condition_valid?' do
    context 'equal_to' do
      let(:predicate) { 'equal_to' }

      it 'pass' do
        result = described_class.new(users_result).send(:condition_valid?, innovation_styles_first_factor_one, 3.0)
        expect(result).to be_truthy
      end

      it 'not pass' do
        result = described_class.new(users_result).send(:condition_valid?, innovation_styles_first_factor_one, 6.0)
        expect(result).to be_falsy
      end
    end
  end

  context '.call' do
    it 'calculates innovation_style score' do
      scoring = {
        innovation_styles_first_factor_one.factor.id.to_s => {
          'results' => [
            {
              value: 4.0
            },
            {
              value: 2.0
            }
          ]
        },
        innovation_styles_first_factor_two.factor.id.to_s => {
          'results' => [
            {
              value: 3.0
            },
            {
              value: 5.0
            }
          ]
        }
      }
      users_result.scoring = scoring
      result = described_class.call!(users_result)
      expect(result.first[:factor_ids]).to eq([innovation_styles_first_factor_one.factor.id])
      expect(result.first[:value]).to eq(50)
    end
    it 'calculates weighted innovation_style score' do
      scoring = {
        innovation_styles_first_factor_three.factor.id.to_s => {
          'results' => [
            {
              value: 4.0
            },
            {
              value: 2.0
            }
          ]
        },
        innovation_styles_first_factor_four.factor.id.to_s => {
          'results' => [
            {
              value: 3.0
            },
            {
              value: 5.0
            }
          ]
        }
      }
      users_result.scoring = scoring
      result = described_class.call!(users_result)
      expect(result.first[:factor_ids]).to eq([innovation_styles_first_factor_four.factor.id])
      expect(result.first[:value]).to eq((1 / 1.5).round(2) * 100)
    end
  end
end
