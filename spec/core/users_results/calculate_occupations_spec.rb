# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::CalculateOccupations do
  let(:users_result) { create(:users_result) }
  let(:dimension) { users_result.assessment.dimension }
  let(:first_factor) { create(:factor, dimension: dimension) }
  let(:second_factor) { create(:factor, dimension: dimension) }
  let(:third_factor) { create(:factor, dimension: dimension) }

  # Occupation and OccupationsFactor #1
  let(:occupation1) { create(:occupation, dimension: dimension) }
  let(:occupations_first_factor_one) { create(:occupations_factor, occupation: occupation1, factor: first_factor) }
  let(:occupations_first_factor_two) { create(:occupations_factor, occupation: occupation1, factor: second_factor) }
  let(:occupations_first_factor_three) do
    create(:occupations_factor, occupation: occupation1, factor: first_factor,
                                       predicate: 'greater_then', value: 4.0, weight: 0.5)
  end
  let(:occupations_first_factor_four) do
    create(:occupations_factor, occupation: occupation1, factor: second_factor,
                                       predicate: 'greater_then', value: 3.0)
  end

  # Occupation and OccupationsFactor #2
  let(:another_occupation) { create(:occupation, dimension: dimension) }
  let(:occupations_second_factor_one) do
    create(:occupations_factor, occupation: another_occupation, factor: first_factor)
  end

  it '.call!' do
    expect(described_class).to respond_to(:call!).with_unlimited_arguments
  end

  context '#condition_valid?' do
    context 'equal_to' do
      let(:predicate) { 'equal_to' }

      it 'pass' do
        result = described_class.new(users_result).send(:condition_valid?, occupations_first_factor_one, 3.0)
        expect(result).to be_truthy
      end

      it 'not pass' do
        result = described_class.new(users_result).send(:condition_valid?, occupations_first_factor_one, 6.0)
        expect(result).to be_falsy
      end
    end
  end

  context '.call' do
    it 'calculates occupation score' do
      scoring = {
        occupations_first_factor_one.factor.id.to_s => {
          'results' => [
            {
              value: 4.0
            },
            {
              value: 2.0
            }
          ]
        },
        occupations_first_factor_two.factor.id.to_s => {
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
      expect(result.first[:factor_ids]).to eq([occupations_first_factor_one.factor.id])
      expect(result.first[:value]).to eq(0.5)
    end
    it 'calculates weighted occupation score' do
      scoring = {
        occupations_first_factor_three.factor.id.to_s => {
          'results' => [
            {
              value: 4.0
            },
            {
              value: 2.0
            }
          ]
        },
        occupations_first_factor_four.factor.id.to_s => {
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
      expect(result.first[:factor_ids]).to eq([occupations_first_factor_four.factor.id])
      expect(result.first[:value]).to eq((1 / 1.5).round(2))
    end
  end
end
