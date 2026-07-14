# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::CalculateOccupations do
  let(:occupation_condition_set) { dimension.reload.default_occupation_condition_set }
  let(:users_result) { create(:users_result) }
  let(:dimension) { users_result.assessment.dimension }

  before { dimension.update!(occupations_enabled: true) }
  before { users_result.update!(occupation_condition_set: occupation_condition_set) }

  let(:first_factor) { create(:factor, dimension: dimension) }
  let(:second_factor) { create(:factor, dimension: dimension) }
  let(:third_factor) { create(:factor, dimension: dimension) }

  # Occupation and OccupationsFactor #1
  let(:occupation1) { create(:occupation, dimension: dimension) }
  let(:occupations_first_factor_one) do
    create(:occupations_factor, occupation: occupation1, factor: first_factor,
           occupation_condition_set: occupation_condition_set)
  end
  let(:occupations_first_factor_two) do
    create(:occupations_factor, occupation: occupation1, factor: second_factor,
           occupation_condition_set: occupation_condition_set)
  end
  let(:occupations_first_factor_three) do
    create(:occupations_factor, occupation: occupation1, factor: first_factor,
                                predicate: 'greater_then', value: 4.0, weight: 0.5,
                                occupation_condition_set: occupation_condition_set)
  end
  let(:occupations_first_factor_four) do
    create(:occupations_factor, occupation: occupation1, factor: second_factor,
                                predicate: 'greater_then', value: 3.0,
                                occupation_condition_set: occupation_condition_set)
  end

  # Occupation and OccupationsFactor #2
  let(:another_occupation) { create(:occupation, dimension: dimension) }
  let(:occupations_second_factor_one) do
    create(:occupations_factor, occupation: another_occupation, factor: first_factor,
           occupation_condition_set: occupation_condition_set)
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
    context 'when occupation_condition_set is not set' do
      before { users_result.update_column(:occupation_condition_set_id, nil) }

      it 'returns an empty array without scoring' do
        result = described_class.call!(users_result)
        expect(result).to eq([])
      end
    end

    context 'when occupation has factors in multiple condition sets' do
      let(:other_condition_set) do
        create(:occupation_condition_set, dimension: dimension, name: 'Other')
      end

      it 'only scores factors belonging to the active condition set' do
        factor_in_active_set = create(:occupations_factor, occupation: occupation1, factor: first_factor,
                                                           occupation_condition_set: occupation_condition_set)
        create(:occupations_factor, occupation: occupation1, factor: second_factor,
                                    occupation_condition_set: other_condition_set)

        users_result.scoring = {
          factor_in_active_set.factor.id.to_s => { 'score' => 3.0, 'results' => [{ value: 3.0 }] }
        }

        result = described_class.call!(users_result)

        expect(result.first[:factor_ids]).to eq([factor_in_active_set.factor.id])
        expect(result.first[:value]).to eq(1.0)
      end
    end

    context 'when the active condition set uses raw scores' do
      before { occupation_condition_set.update!(score_type: 'raw') }

      it 'uses the factor score instead of averaging results again' do
        users_result.scoring = {
          occupations_first_factor_one.factor.id.to_s => {
            'score' => 3.0,
            'results' => [{ value: 6.0 }]
          },
          occupations_first_factor_two.factor.id.to_s => {
            'score' => 4.0,
            'results' => [{ value: 1.0 }]
          }
        }

        result = described_class.call!(users_result)

        expect(result.first[:factor_ids]).to eq([occupations_first_factor_one.factor.id])
        expect(result.first[:value]).to eq(0.5)
      end
    end

    context 'when the active condition set uses normed scores' do
      before { occupation_condition_set.update!(score_type: 'normed') }

      it 'uses the factor norm score for occupation conditions' do
        users_result.scoring = {
          occupations_first_factor_one.factor.id.to_s => {
            'score' => 6.0,
            'norm_score' => 3.0,
            'results' => [{ value: 6.0 }]
          },
          occupations_first_factor_two.factor.id.to_s => {
            'score' => 3.0,
            'norm_score' => 6.0,
            'results' => [{ value: 3.0 }]
          }
        }

        result = described_class.call!(users_result)

        expect(result.first[:factor_ids]).to eq([occupations_first_factor_one.factor.id])
        expect(result.first[:value]).to eq(0.5)
      end
    end

    it 'calculates occupation score' do
      scoring = {
        occupations_first_factor_one.factor.id.to_s => {
          'score' => 3.0,
          'results' => [{ value: 4.0 }, { value: 2.0 }]
        },
        occupations_first_factor_two.factor.id.to_s => {
          'score' => 4.0,
          'results' => [{ value: 3.0 }, { value: 5.0 }]
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
          'score' => 3.0,
          'results' => [{ value: 4.0 }, { value: 2.0 }]
        },
        occupations_first_factor_four.factor.id.to_s => {
          'score' => 4.0,
          'results' => [{ value: 3.0 }, { value: 5.0 }]
        }
      }
      users_result.scoring = scoring
      result = described_class.call!(users_result)
      expect(result.first[:factor_ids]).to eq([occupations_first_factor_four.factor.id])
      expect(result.first[:value]).to eq((1 / 1.5).round(2))
    end
  end
end
