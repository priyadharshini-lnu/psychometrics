# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OccupationsFactor, type: :model do
  subject { build(:occupations_factor) }

  context 'Relations' do
    it { should belong_to(:factor) }
    it { should belong_to(:occupation) }
  end

  context 'Validations' do
    it { should validate_presence_of(:predicate) }
    it { should validate_presence_of(:value) }
    it { should validate_numericality_of(:value).is_greater_than_or_equal_to(0).allow_nil }
    it { should validate_numericality_of(:position).is_greater_than_or_equal_to(0).allow_nil }

    describe 'uniqueness of factor_id' do
      let(:occupation) { create(:occupation) }
      let(:condition_set) { create(:occupation_condition_set, dimension: occupation.dimension) }
      let!(:existing_factor) do
        create(:occupations_factor, occupation: occupation, occupation_condition_set: condition_set)
      end

      it 'does not allow duplicate factor_id in same occupation and condition set' do
        duplicate = build(
          :occupations_factor,
          occupation: occupation,
          occupation_condition_set: condition_set,
          factor: existing_factor.factor
        )
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:factor_id]).to include('Factor has already been taken')
      end

      it 'allows same factor_id in different occupation' do
        different_occupation = create(:occupation)
        allowed = build(
          :occupations_factor,
          occupation: different_occupation,
          factor: existing_factor.factor
        )
        expect(allowed).to be_valid
      end

      it 'allows same factor_id in different condition set of same occupation' do
        different_condition_set = create(:occupation_condition_set, dimension: occupation.dimension, name: 'Second Set')
        allowed = build(
          :occupations_factor,
          occupation: occupation,
          occupation_condition_set: different_condition_set,
          factor: existing_factor.factor
        )
        expect(allowed).to be_valid
      end
    end
  end

  context 'Callbacks' do
    describe '#set_default_weight' do
      it 'defaults weight to 1.0 if weight is nil' do
        factor = build(:occupations_factor, weight: nil)
        factor.valid?
        expect(factor.weight).to eq(1.0)
      end

      it 'keeps existing weight if it is not nil' do
        factor = build(:occupations_factor, weight: 2.5)
        factor.valid?
        expect(factor.weight).to eq(2.5)
      end
    end
  end
end
