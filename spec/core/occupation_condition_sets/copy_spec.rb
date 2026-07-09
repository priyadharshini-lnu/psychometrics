# frozen_string_literal: true

require 'rails_helper'

describe OccupationConditionSets::Copy do
  let(:dimension) { create(:dimension, occupations_enabled: true) }
  let(:source) { dimension.default_occupation_condition_set }
  let(:new_name) { 'New Copied Set' }

  context 'when the new name is unique' do
    it 'creates a new condition set with the given name and copies all occupations factors' do
      factor1 = create(:factor, dimension: dimension)
      factor2 = create(:factor, dimension: dimension)
      occupation1 = create(:occupation, dimension: dimension)
      occupation2 = create(:occupation, dimension: dimension)

      create(:occupations_factor, occupation: occupation1, factor: factor1, occupation_condition_set: source)
      create(:occupations_factor, occupation: occupation2, factor: factor2, occupation_condition_set: source)

      new_set = nil
      expect do
        new_set = described_class.call!(source, new_name)
      end.to change(OccupationConditionSet, :count).by(1).
        and change(OccupationsFactor, :count).by(2)

      expect(new_set.name).to eq(new_name)
      expect(new_set.dimension).to eq(dimension)
      expect(new_set.occupations_factors.count).to eq(2)

      original_combos = source.occupations_factors.map { |f| [f.occupation_id, f.factor_id] }
      copied_combos = new_set.occupations_factors.map { |f| [f.occupation_id, f.factor_id] }

      expect(copied_combos).to match_array(original_combos)
    end
  end

  context 'when the new name already exists in the dimension' do
    it 'broadcasts error without creating any records' do
      create(:occupation_condition_set, dimension: dimension, name: new_name)

      errors_received = nil
      expect do
        described_class.call(source, new_name) { on(:error) { |errors| errors_received = errors } }
      end.not_to change(OccupationConditionSet, :count)

      expect(errors_received[:name]).to be_present
    end
  end
end
