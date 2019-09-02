require 'rails_helper'

describe Assigns::CalculateOccupations do
  let(:assign) { create(:assign) }
  let(:dimension) { assign.assessment.dimension }
  let(:factor1) { create(:factor, dimension: dimension) }
  let(:factor2) { create(:factor, dimension: dimension) }
  let(:factor3) { create(:factor, dimension: dimension) }

  # Occupation and OccupationsFactor #1
  let(:occupation1) { create(:occupation, dimension: dimension) }
  let(:occupations_factor1_1) { create(:occupations_factor, occupation: occupation1, factor: factor1) }
  let(:occupations_factor1_2) { create(:occupations_factor, occupation: occupation1, factor: factor2) }
  let(:occupations_factor1_3) { create(:occupations_factor, occupation: occupation1, factor: factor1, predicate: 'greater_then', value: 4.0, weight: 0.5) }
  let(:occupations_factor1_4) { create(:occupations_factor, occupation: occupation1, factor: factor2, predicate: 'greater_then', value: 3.0) }

  # Occupation and OccupationsFactor #2
  let(:occupation2) { create(:occupation, dimension: dimension) }
  let(:occupations_factor2_1) { create(:occupations_factor, occupation: occupation2, factor: factor1) }

  it '.call!' do
    expect(described_class).to respond_to(:'call!').with_unlimited_arguments
  end

  context '#condition_valid?' do
    context 'equal_to' do
      let(:predicate) { 'equal_to' }

      it 'pass' do
        result = described_class.new(assign).send(:condition_valid?, occupations_factor1_1, 3.0)
        expect(result).to be_truthy
      end

      it 'not pass' do
        result = described_class.new(assign).send(:condition_valid?, occupations_factor1_1, 6.0)
        expect(result).to be_falsy
      end
    end
  end

  context '.call' do
    it 'calculates occupation score' do
      scoring = {
        "#{occupations_factor1_1.factor.id}" => {
          'results' => [
            {
              value: 4.0
            },
            {
              value: 2.0
            }
          ]
        },
        "#{occupations_factor1_2.factor.id}" => {
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
      expect(result.first[:factor_ids]).to eq([occupations_factor1_1.factor.id])
      expect(result.first[:value]).to eq(0.5)
    end
    it 'calculates weighted occupation score' do
      scoring = {
        "#{occupations_factor1_3.factor.id}" => {
          'results' => [
            {
              value: 4.0
            },
            {
              value: 2.0
            }
          ]
        },
        "#{occupations_factor1_4.factor.id}" => {
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
      expect(result.first[:factor_ids]).to eq([occupations_factor1_4.factor.id])
      expect(result.first[:value]).to eq((1/1.5).round(2))
    end
  end
end
