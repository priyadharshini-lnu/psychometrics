# frozen_string_literal: true

require 'rails_helper'

describe Dimensions::SaveSubFactors do
  let(:client) { create(:tenancy) }
  let(:dimension) { create(:dimension, owner: client) }
  let(:factor) { create(:factor, name: 'factor', dimension: dimension) }
  let(:sub_factor1) { create(:factor, name: 'sub_factor1', dimension: dimension) }
  let(:sub_factor2) { create(:factor, name: 'sub_factor2', dimension: dimension) }
  let(:sub_factor3) { create(:factor, name: 'sub_factor3', dimension: dimension) }

  describe '#call' do
    context 'when creating new sub-factor relationships' do
      let(:sub_factors_params) do
        [
          {
            id: nil,
            sub_factor_id: sub_factor1.id,
            predicate: '==',
            weight: 0.5,
            value: 0.1,
            position: 1
          },
          {
            id: nil,
            sub_factor_id: sub_factor2.id,
            predicate: '>=',
            weight: 0.3,
            value: 0.2,
            position: 2
          }
        ]
      end

      it 'creates new factors_sub_factors records' do
        expect do
          described_class.new(factor, sub_factors_params).call
        end.to change { factor.factors_sub_factors.count }.by(2)

        factor.reload

        expect(factor.factors_sub_factors.count).to eq(2)

        first_sub_factor = factor.factors_sub_factors.find_by(sub_factor_id: sub_factor1.id)
        expect(first_sub_factor.predicate).to eq('==')
        expect(first_sub_factor.weight).to eq(0.5)
        expect(first_sub_factor.value).to eq(0.1)
        expect(first_sub_factor.position).to eq(1)

        second_sub_factor = factor.factors_sub_factors.find_by(sub_factor_id: sub_factor2.id)
        expect(second_sub_factor.predicate).to eq('>=')
        expect(second_sub_factor.weight).to eq(0.3)
        expect(second_sub_factor.value).to eq(0.2)
        expect(second_sub_factor.position).to eq(2)
      end
    end

    context 'when updating existing sub-factor relationships' do
      let!(:existing_sub_factor_relation) do
        factor.factors_sub_factors.create!(
          sub_factor_id: sub_factor1.id,
          predicate: '==',
          weight: 0.5,
          value: 0.1,
          position: 1
        )
      end

      let(:sub_factors_params) do
        [
          {
            id: existing_sub_factor_relation.id,
            sub_factor_id: sub_factor1.id,
            predicate: '==',
            weight: 0.8,
            value: 0.2,
            position: 3
          }
        ]
      end

      it 'updates existing factors_sub_factors records' do
        expect do
          described_class.new(factor, sub_factors_params).call
        end.not_to(change { factor.factors_sub_factors.count })

        existing_sub_factor_relation.reload
        expect(existing_sub_factor_relation.predicate).to eq('==')
        expect(existing_sub_factor_relation.weight).to eq(0.8)
        expect(existing_sub_factor_relation.value).to eq(0.2)
        expect(existing_sub_factor_relation.position).to eq(3)
      end
    end

    context 'when removing sub-factor relationships' do
      let!(:sub_factor_relation1) do
        factor.factors_sub_factors.create!(
          sub_factor_id: sub_factor1.id,
          predicate: '==',
          weight: 0.5,
          value: 1,
          position: 1
        )
      end

      let!(:sub_factor_relation2) do
        factor.factors_sub_factors.create!(
          sub_factor_id: sub_factor2.id,
          predicate: '>=',
          weight: 0.3,
          value: 2,
          position: 2
        )
      end

      let(:sub_factors_params) do
        [
          {
            id: sub_factor_relation1.id,
            sub_factor_id: sub_factor1.id,
            predicate: '==',
            weight: 0.5,
            value: 1,
            position: 1
          }
        ]
      end

      it 'removes sub-factor relationships not present in params' do
        expect do
          described_class.new(factor, sub_factors_params).call
        end.to change { factor.factors_sub_factors.count }.from(2).to(1)

        factor.reload
        expect(factor.factors_sub_factors.pluck(:id)).to eq([sub_factor_relation1.id])
        expect(FactorsSubFactor.find_by(id: sub_factor_relation2.id)).to be_nil
      end
    end

    context 'when mixing create, update, and delete operations' do
      let!(:existing_relation_to_update) do
        factor.factors_sub_factors.create!(
          sub_factor_id: sub_factor1.id,
          predicate: '==',
          weight: 0.5,
          value: 'old_value',
          position: 1
        )
      end

      let!(:existing_relation_to_delete) do
        factor.factors_sub_factors.create!(
          sub_factor_id: sub_factor2.id,
          predicate: '>=',
          weight: 0.3,
          value: 0.1,
          position: 2
        )
      end

      let(:sub_factors_params) do
        [
          {
            id: existing_relation_to_update.id,
            sub_factor_id: sub_factor1.id,
            predicate: '!==',
            weight: 0.8,
            value: 0.5,
            position: 3
          },
          {
            id: nil,
            sub_factor_id: sub_factor3.id,
            predicate: '<',
            weight: 0.2,
            value: 1,
            position: 4
          }
        ]
      end

      it 'handles mixed operations correctly' do
        described_class.new(factor, sub_factors_params).call
        factor.reload

        updated_relation = factor.factors_sub_factors.find_by(id: existing_relation_to_update.id)
        expect(updated_relation.predicate).to eq('!==')
        expect(updated_relation.weight).to eq(0.8)
        expect(updated_relation.value).to eq(0.5)
        expect(updated_relation.position).to eq(3)

        new_relation = factor.factors_sub_factors.find_by(sub_factor_id: sub_factor3.id)
        expect(new_relation.predicate).to eq('<')
        expect(new_relation.weight).to eq(0.2)
        expect(new_relation.value).to eq(1)
        expect(new_relation.position).to eq(4)

        expect(FactorsSubFactor.find_by(id: existing_relation_to_delete.id)).to be_nil
      end
    end

    context 'when handling empty params' do
      let!(:existing_relation) do
        factor.factors_sub_factors.create!(
          sub_factor_id: sub_factor1.id,
          predicate: '==',
          weight: 0.5,
          value: 'value',
          position: 1
        )
      end

      let(:sub_factors_params) { [] }

      it 'removes all existing relations when params are empty' do
        expect do
          described_class.new(factor, sub_factors_params).call
        end.to change { factor.factors_sub_factors.count }.from(1).to(0)

        expect(FactorsSubFactor.find_by(id: existing_relation.id)).to be_nil
      end
    end
  end
end
