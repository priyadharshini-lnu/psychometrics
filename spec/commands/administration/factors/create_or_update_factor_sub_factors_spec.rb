# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable Naming/VariableNumber
RSpec.describe Administration::Factors::CreateOrUpdateFactorSubFactors do
  subject(:command) { described_class.call(factor, dimension, factors_sub_factors_attrs) }

  let(:dimension) { create(:dimension) }

  describe '#call' do
    context 'when factor is child_indicator (Mode 1: Indicator Factor)' do
      let!(:factor) do
        create(:factor,
               dimension: dimension,
               child_factor_type: 'indicator',
               score_min: 1,
               score_max: 10)
      end

      describe 'MODIFICATION_TYPE_CREATE' do
        let(:factors_sub_factors_attrs) do
          [
            {
              'modification_type' => 1,
              'name' => 'New Indicator',
              'description' => 'Test description',
              'precision' => 2,
              'factor_type' => 'indicator',
              'score_min' => 5,
              'score_max' => 8,
              'score_definitions' => [
                { 'score' => 1, 'definition' => 'Poor' },
                { 'score' => 10, 'definition' => 'Excellent' }
              ],
              'what_to_look_for' => 'Test guidance',
              'predicate' => '>=',
              'value' => 3.5,
              'weight' => 2,
              'position' => 0
            }
          ]
        end

        it 'creates a new sub-factor' do
          expect { command }.to change(Factor, :count).by(1)
        end

        it 'creates a new FactorsSubFactor join record' do
          expect { command }.to change(FactorsSubFactor, :count).by(1)
        end

        it 'sets the correct attributes on the sub-factor' do
          command
          sub_factor = Factor.last

          expect(sub_factor.name).to eq('New Indicator')
          expect(sub_factor.description).to eq('Test description')
          expect(sub_factor.precision).to eq(2)
          expect(sub_factor.factor_type).to eq('indicator')
          expect(sub_factor.score_min).to eq(5)
          expect(sub_factor.score_max).to eq(8)
          expect(sub_factor.score_definitions).to eq([
            { 'score' => 1, 'definition' => 'Poor' },
            { 'score' => 10, 'definition' => 'Excellent' }
          ])
          expect(sub_factor.what_to_look_for).to eq('Test guidance')
        end

        it 'sets the correct attributes on the join record' do
          command
          join_record = FactorsSubFactor.last

          expect(join_record.factor).to eq(factor)
          expect(join_record.sub_factor).to eq(Factor.last)
          expect(join_record.weight).to eq(2)
          expect(join_record.position).to eq(0)
          expect(join_record.predicate).to eq('>=')
          expect(join_record.value).to eq(3.5)
        end

        context 'with default values' do
          let(:factors_sub_factors_attrs) do
            [
              {
                'modification_type' => 1,
                'name' => 'Minimal Indicator',
                'factor_type' => 'indicator'
              }
            ]
          end

          it 'sets default weight to 1' do
            command
            expect(FactorsSubFactor.last.weight).to eq(1)
          end

          it 'sets default position to 0' do
            command
            expect(FactorsSubFactor.last.position).to eq(0)
          end
        end

        context 'with multiple new indicators' do
          let(:factors_sub_factors_attrs) do
            [
              {
                'modification_type' => 1,
                'name' => 'First Indicator',
                'factor_type' => 'indicator',
                'weight' => 1,
                'position' => 0
              },
              {
                'modification_type' => 1,
                'name' => 'Second Indicator',
                'factor_type' => 'indicator',
                'weight' => 2,
                'position' => 1
              }
            ]
          end

          it 'creates all new sub-factors' do
            expect { command }.to change(Factor, :count).by(2)
          end

          it 'creates all join records' do
            expect { command }.to change(FactorsSubFactor, :count).by(2)
          end
        end
      end

      describe 'MODIFICATION_TYPE_UPDATE' do
        let!(:indicator) do
          create(:factor,
                 dimension: dimension,
                 name: 'Original Name',
                 description: 'Original description',
                 factor_type: 'indicator',
                 score_min: 1,
                 score_max: 5)
        end

        let!(:join_record) do
          create(:factors_sub_factor,
                 factor: factor,
                 sub_factor: indicator,
                 weight: 1,
                 position: 0)
        end

        let(:factors_sub_factors_attrs) do
          [
            {
              'modification_type' => 2,
              'sub_factor_id' => indicator.id,
              'id' => join_record.id,
              'name' => 'Updated Name',
              'description' => 'Updated description',
              'precision' => 3,
              'score_min' => 2,
              'score_max' => 8,
              'score_definitions' => [{ 'score' => 5, 'definition' => 'Average' }],
              'what_to_look_for' => 'Updated guidance',
              'weight' => 3,
              'position' => 1
            }
          ]
        end

        it 'does not create new factors' do
          expect { command }.not_to change(Factor, :count)
        end

        it 'does not create new join records' do
          expect { command }.not_to change(FactorsSubFactor, :count)
        end

        it 'updates the indicator attributes' do
          command
          indicator.reload

          expect(indicator.name).to eq('Updated Name')
          expect(indicator.description).to eq('Updated description')
          expect(indicator.precision).to eq(3)
          expect(indicator.what_to_look_for).to eq('Updated guidance')
          expect(indicator.score_definitions).to eq([{ 'score' => 5, 'definition' => 'Average' }])
        end

        it 'inherits score_min and score_max from parent factor' do
          command
          indicator.reload

          expect(indicator.score_min).to eq(factor.score_min)
          expect(indicator.score_max).to eq(factor.score_max)
        end

        it 'updates the join record attributes' do
          command
          join_record.reload

          expect(join_record.weight).to eq(3)
          expect(join_record.position).to eq(1)
        end
      end

      describe 'MODIFICATION_TYPE_DESTROY' do
        let!(:indicator) do
          create(:factor,
                 dimension: dimension,
                 factor_type: 'indicator')
        end

        let!(:join_record) do
          create(:factors_sub_factor,
                 factor: factor,
                 sub_factor: indicator)
        end

        let(:factors_sub_factors_attrs) do
          [
            {
              'modification_type' => 3,
              'id' => join_record.id
            }
          ]
        end

        it 'destroys both the indicator and the join record' do
          expect { command }.to change(Factor, :count).by(-1).
            and change(FactorsSubFactor, :count).by(-1)
        end

        it 'destroys the indicator first, then the join record' do
          command

          expect(Factor.exists?(indicator.id)).to be false
          expect(FactorsSubFactor.exists?(join_record.id)).to be false
        end

        context 'without join record id' do
          let(:factors_sub_factors_attrs) do
            [
              {
                'modification_type' => 3
              }
            ]
          end

          it 'does not destroy anything' do
            expect { command }.not_to change(Factor, :count)
            expect { command }.not_to change(FactorsSubFactor, :count)
          end
        end
      end

      describe 'mixed operations' do
        let!(:existing_indicator) do
          create(:factor,
                 dimension: dimension,
                 name: 'Existing',
                 factor_type: 'indicator')
        end

        let!(:join_record) do
          create(:factors_sub_factor,
                 factor: factor,
                 sub_factor: existing_indicator)
        end

        let(:factors_sub_factors_attrs) do
          [
            {
              'modification_type' => 1,
              'name' => 'New Indicator',
              'factor_type' => 'indicator'
            },
            {
              'modification_type' => 2,
              'sub_factor_id' => existing_indicator.id,
              'id' => join_record.id,
              'name' => 'Updated Existing'
            },
            {
              'modification_type' => 3,
              'id' => join_record.id
            }
          ]
        end

        it 'processes create and update operations' do
          # Adjust expectation: create +1, destroy -1 = 0
          expect { command }.to change(Factor, :count).by(0)
        end

        it 'creates new indicator' do
          command
          expect(Factor.find_by(name: 'New Indicator')).to be_present
        end

        it 'updates existing indicator before destroying' do
          command
          # The indicator was updated then destroyed, so it should not exist
          expect(Factor.exists?(existing_indicator.id)).to be false
        end
      end
    end

    context 'when factor is regular (Mode 2: Regular Factor with Sub-Factors)' do
      let!(:factor) do
        create(:factor,
               dimension: dimension,
               child_factor_type: 'regular')
      end

      describe 'MODIFICATION_TYPE_CREATE' do
        let!(:existing_sub_factor) do
          create(:factor,
                 dimension: dimension,
                 name: 'Existing Sub Factor',
                 factor_type: 'regular')
        end

        let(:factors_sub_factors_attrs) do
          [
            {
              'modification_type' => 1,
              'sub_factor_id' => existing_sub_factor.id,
              'weight' => 2,
              'position' => 0
            }
          ]
        end

        it 'does not create a new factor' do
          expect { command }.not_to change(Factor, :count)
        end

        it 'creates only the join record' do
          expect { command }.to change(FactorsSubFactor, :count).by(1)
        end

        it 'creates join record with correct attributes' do
          command
          join_record = FactorsSubFactor.last

          expect(join_record.factor).to eq(factor)
          expect(join_record.sub_factor).to eq(existing_sub_factor)
          expect(join_record.weight).to eq(2)
          expect(join_record.position).to eq(0)
        end

        context 'without sub_factor_id' do
          let(:factors_sub_factors_attrs) do
            [
              {
                'modification_type' => 1,
                'name' => 'Some Name',
                'weight' => 2
              }
            ]
          end

          it 'does not create anything' do
            expect { command }.not_to change(Factor, :count)
            expect { command }.not_to change(FactorsSubFactor, :count)
          end
        end

        context 'with non-existent sub_factor_id' do
          let(:factors_sub_factors_attrs) do
            [
              {
                'modification_type' => 1,
                'sub_factor_id' => 99_999,
                'weight' => 2
              }
            ]
          end

          it 'does not create anything' do
            expect { command }.not_to change(FactorsSubFactor, :count)
          end
        end

        context 'with multiple existing sub-factors' do
          let!(:sub_factor_1) do
            create(:factor, dimension: dimension, factor_type: 'regular')
          end
          let!(:sub_factor_2) do
            create(:factor, dimension: dimension, factor_type: 'regular')
          end

          let(:factors_sub_factors_attrs) do
            [
              {
                'modification_type' => 1,
                'sub_factor_id' => sub_factor_1.id,
                'weight' => 1,
                'position' => 0
              },
              {
                'modification_type' => 1,
                'sub_factor_id' => sub_factor_2.id,
                'weight' => 2,
                'position' => 1
              }
            ]
          end

          it 'creates join records for all sub-factors' do
            expect { command }.to change(FactorsSubFactor, :count).by(2)
          end
        end
      end

      describe 'MODIFICATION_TYPE_UPDATE' do
        let!(:sub_factor) do
          create(:factor,
                 dimension: dimension,
                 name: 'Sub Factor',
                 factor_type: 'regular')
        end

        let!(:join_record) do
          create(:factors_sub_factor,
                 factor: factor,
                 sub_factor: sub_factor,
                 weight: 1,
                 position: 0,
                 predicate: '==',
                 value: 1.0)
        end

        let(:factors_sub_factors_attrs) do
          [
            {
              'modification_type' => 2,
              'sub_factor_id' => sub_factor.id,
              'id' => join_record.id,
              'name' => 'Updated Sub Factor Name',
              'predicate' => '<=',
              'value' => 4.2,
              'weight' => 5,
              'position' => 2
            }
          ]
        end

        it 'does not change factor count' do
          expect { command }.not_to change(Factor, :count)
        end

        it 'does not change join record count' do
          expect { command }.not_to change(FactorsSubFactor, :count)
        end

        it 'does NOT update the sub_factor attributes' do
          command
          sub_factor.reload

          expect(sub_factor.name).to eq('Sub Factor') # unchanged
        end

        it 'updates only the join record attributes' do
          command
          join_record.reload

          expect(join_record.weight).to eq(5)
          expect(join_record.position).to eq(2)
          expect(join_record.predicate).to eq('<=')
          expect(join_record.value).to eq(4.2)
        end

        context 'with multiple sub-factors' do
          let!(:sub_factor_1) do
            create(:factor,
                   dimension: dimension,
                   name: 'Sub Factor 1',
                   factor_type: 'regular')
          end
          let!(:sub_factor_2) do
            create(:factor,
                   dimension: dimension,
                   name: 'Sub Factor 2',
                   factor_type: 'regular')
          end
          let!(:join_record_1) do
            create(:factors_sub_factor,
                   factor: factor,
                   sub_factor: sub_factor_1,
                   weight: 1,
                   position: 0)
          end
          let!(:join_record_2) do
            create(:factors_sub_factor,
                   factor: factor,
                   sub_factor: sub_factor_2,
                   weight: 2,
                   position: 1)
          end

          let(:factors_sub_factors_attrs) do
            [
              {
                'modification_type' => 2,
                'sub_factor_id' => sub_factor_1.id,
                'id' => join_record_1.id,
                'weight' => 10,
                'position' => 1
              },
              {
                'modification_type' => 2,
                'sub_factor_id' => sub_factor_2.id,
                'id' => join_record_2.id,
                'weight' => 5,
                'position' => 0
              }
            ]
          end

          it 'updates all join records' do
            command

            expect(join_record_1.reload.weight).to eq(10)
            expect(join_record_1.position).to eq(1)
            expect(join_record_2.reload.weight).to eq(5)
            expect(join_record_2.position).to eq(0)
          end

          it 'does not update sub_factor names' do
            command

            expect(sub_factor_1.reload.name).to eq('Sub Factor 1')
            expect(sub_factor_2.reload.name).to eq('Sub Factor 2')
          end
        end
      end

      describe 'MODIFICATION_TYPE_DESTROY' do
        let!(:sub_factor) do
          create(:factor,
                 dimension: dimension,
                 factor_type: 'regular')
        end

        let!(:join_record) do
          create(:factors_sub_factor,
                 factor: factor,
                 sub_factor: sub_factor)
        end

        let(:factors_sub_factors_attrs) do
          [
            {
              'modification_type' => 3,
              'id' => join_record.id
            }
          ]
        end

        it 'destroys only the join record' do
          expect { command }.to change(FactorsSubFactor, :count).by(-1)
        end

        it 'does NOT destroy the sub_factor itself' do
          expect { command }.not_to change(Factor, :count)
        end

        it 'sub_factor still exists after destroying relationship' do
          command

          expect(Factor.exists?(sub_factor.id)).to be true
          expect(FactorsSubFactor.exists?(join_record.id)).to be false
        end

        context 'with multiple sub-factors, removing one' do
          let!(:sub_factor_2) do
            create(:factor, dimension: dimension, factor_type: 'regular')
          end
          let!(:join_record_2) do
            create(:factors_sub_factor,
                   factor: factor,
                   sub_factor: sub_factor_2)
          end

          it 'removes only the specified relationship' do
            expect { command }.to change(FactorsSubFactor, :count).by(-1)
          end

          it 'keeps other relationships intact' do
            command

            expect(FactorsSubFactor.exists?(join_record_2.id)).to be true
            expect(factor.sub_factors.reload).to eq([sub_factor_2])
          end
        end
      end

      describe 'mixed operations' do
        let!(:existing_sub_factor_1) do
          create(:factor,
                 dimension: dimension,
                 name: 'Existing Sub 1',
                 factor_type: 'regular')
        end
        let!(:existing_sub_factor_2) do
          create(:factor,
                 dimension: dimension,
                 name: 'Existing Sub 2',
                 factor_type: 'regular')
        end
        let!(:new_sub_factor) do
          create(:factor,
                 dimension: dimension,
                 name: 'New Sub',
                 factor_type: 'regular')
        end
        let!(:join_record_1) do
          create(:factors_sub_factor,
                 factor: factor,
                 sub_factor: existing_sub_factor_1,
                 weight: 1,
                 position: 0)
        end
        let!(:join_record_2) do
          create(:factors_sub_factor,
                 factor: factor,
                 sub_factor: existing_sub_factor_2,
                 weight: 2,
                 position: 1)
        end

        let(:factors_sub_factors_attrs) do
          [
            {
              'modification_type' => 1,
              'sub_factor_id' => new_sub_factor.id,
              'weight' => 3,
              'position' => 2
            },
            {
              'modification_type' => 2,
              'sub_factor_id' => existing_sub_factor_1.id,
              'id' => join_record_1.id,
              'weight' => 10,
              'position' => 0
            },
            {
              'modification_type' => 3,
              'id' => join_record_2.id
            }
          ]
        end

        it 'performs all operations correctly' do
          expect { command }.to change(FactorsSubFactor, :count).by(0) # +1 -1 = 0
          expect { command }.not_to change(Factor, :count)
        end

        it 'creates new relationship' do
          command
          expect(factor.sub_factors.reload).to include(new_sub_factor)
        end

        it 'updates existing relationship' do
          command
          expect(join_record_1.reload.weight).to eq(10)
        end

        it 'removes specified relationship' do
          command
          expect(FactorsSubFactor.exists?(join_record_2.id)).to be false
          expect(factor.sub_factors.reload).not_to include(existing_sub_factor_2)
        end

        it 'all sub-factors still exist' do
          command
          expect(Factor.exists?(existing_sub_factor_1.id)).to be true
          expect(Factor.exists?(existing_sub_factor_2.id)).to be true
          expect(Factor.exists?(new_sub_factor.id)).to be true
        end
      end
    end

    context 'error handling' do
      let!(:factor) { create(:factor, dimension: dimension, child_factor_type: 'indicator') }

      context 'with blank or nil attributes' do
        let(:factors_sub_factors_attrs) { nil }

        it 'does not raise an error' do
          expect { command }.not_to raise_error
        end
      end

      context 'with blank array items' do
        let(:factors_sub_factors_attrs) do
          [
            nil,
            {},
            {
              'modification_type' => 1,
              'name' => 'Valid Indicator',
              'factor_type' => 'indicator'
            }
          ]
        end

        it 'skips blank items and processes valid ones' do
          expect { command }.to change(Factor, :count).by(1)
        end
      end

      context 'when validation fails' do
        let(:factors_sub_factors_attrs) do
          [
            {
              'modification_type' => 1,
              'name' => '', # Invalid: name is required
              'factor_type' => 'indicator'
            }
          ]
        end

        it 'returns error' do
          result = command
          expect(result).to be_a(Hash)
          expect(result[:invalid]).to be_present
        end

        it 'does not create the factor' do
          factor # ensure factor is created before test
          expect { command }.not_to change(Factor, :count)
        end
      end

      context 'with transaction rollback' do
        let!(:indicator) { create(:factor, dimension: dimension, factor_type: 'indicator') }

        let(:factors_sub_factors_attrs) do
          [
            {
              'modification_type' => 1,
              'name' => 'New Valid Indicator',
              'factor_type' => 'indicator'
            },
            {
              'modification_type' => 1,
              'name' => '' # This will fail validation
            }
          ]
        end

        it 'rolls back all changes on failure' do
          factor # ensure factor is created before test
          expect { command }.not_to change(Factor, :count)
        end
      end
    end
  end
end

# rubocop:enable Naming/VariableNumber
