# frozen_string_literal: true

require 'rails_helper'

describe Administration::Factors::CreateOrUpdateFactor do
  let(:dimension) { create(:dimension) }
  let(:factor) { create(:factor, dimension: dimension) }
  let(:sub_factor) { create(:factor, dimension: dimension, factor_type: :indicator) }

  describe 'creating a new factor' do
    subject { described_class.call(new_factor, dimension, params) }

    let(:new_factor) { dimension.factors.new }
    let(:params) do
      {
        'name' => 'New Factor',
        'description' => 'Test description',
        'scoring_strategy' => 'sub_factors_average',
        'new_indicators_attributes' => [],
        'factors_sub_factors_attributes' => []
      }
    end

    it 'broadcasts :ok and creates the factor' do
      expect { subject }.to broadcast(:ok)
      expect(subject[:ok]).to be_an_instance_of(Factor)
      expect(subject[:ok].name).to eq('New Factor')
      expect(subject[:ok].description).to eq('Test description')
    end

    context 'with invalid params' do
      let(:params) { { 'name' => '' } }

      it 'broadcasts :invalid' do
        expect { subject }.to broadcast(:invalid)
      end
    end
  end

  describe 'updating an existing factor' do
    subject { described_class.call(factor, dimension, params) }

    let(:params) do
      {
        'name' => 'Updated Factor Name',
        'description' => 'Updated description',
        'new_indicators_attributes' => [],
        'factors_sub_factors_attributes' => []
      }
    end

    it 'broadcasts :ok and updates the factor' do
      expect { subject }.to broadcast(:ok)
      expect(subject[:ok].name).to eq('Updated Factor Name')
      expect(subject[:ok].description).to eq('Updated description')
    end
  end

  describe 'updating sub_factor attributes' do
    subject { described_class.call(factor, dimension, params) }

    let!(:factors_sub_factor) do
      create(:factors_sub_factor, factor: factor, sub_factor: sub_factor, weight: 1, position: 0)
    end

    let(:params) do
      {
        'name' => factor.name,
        'new_indicators_attributes' => [],
        'factors_sub_factors_attributes' => [
          {
            'id' => factors_sub_factor.id.to_s,
            'sub_factor_id' => sub_factor.id.to_s,
            'weight' => '2',
            'position' => '1',
            'name' => 'Updated Sub Factor Name',
            'description' => 'Updated sub factor description',
            'precision' => '3'
          }
        ]
      }
    end

    it 'updates join table attributes' do
      subject
      factors_sub_factor.reload
      expect(factors_sub_factor.weight).to eq(2)
      expect(factors_sub_factor.position).to eq(1)
    end

    it 'updates sub_factor model attributes' do
      subject
      sub_factor.reload
      expect(sub_factor.name).to eq('Updated Sub Factor Name')
      expect(sub_factor.description).to eq('Updated sub factor description')
      expect(sub_factor.precision).to eq(3)
    end
  end

  describe 'creating new indicators' do
    subject { described_class.call(factor, dimension, params) }

    let!(:existing_factor) { factor }

    let(:params) do
      {
        'name' => factor.name,
        'factors_sub_factors_attributes' => [],
        'new_indicators_attributes' => [
          {
            'name' => 'New Indicator',
            'description' => 'Indicator description',
            'precision' => '2',
            'weight' => '1',
            'position' => '0',
            'factor_type' => 'indicator',
            '_is_new' => 'true'
          }
        ]
      }
    end

    it 'creates new indicator factor' do
      expect { subject }.to change(Factor, :count).by(1)
      new_indicator = Factor.last
      expect(new_indicator.name).to eq('New Indicator')
      expect(new_indicator.factor_type).to eq('indicator')
    end

    it 'links indicator to parent factor' do
      expect { subject }.to change(FactorsSubFactor, :count).by(1)
    end
  end
end
