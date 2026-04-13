# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::FactorsNorm::UpdateContract do
  subject(:contract) { described_class.new(schema: Api::V2::FactorsNorm::Schema.update_request) }

  let(:factors_norm) { create(:factors_norm) }

  let(:valid_params) do
    {
      data: {
        type: 'factors_norms',
        attributes: {
          norm_id: factors_norm.norm_id,
          factor_id: factors_norm.factor_id,
          level: 'Low',
          field_name: 'score_from',
          field_value: '1.00'
        }
      }
    }
  end

  it 'passes with valid params' do
    result = contract.call(valid_params, { params: valid_params })

    expect(result.success?).to be_truthy
    expect(result.errors.to_hash).to be_empty
  end

  it 'fails when field_value is not a valid float' do
    invalid_params = valid_params.deep_dup
    invalid_params[:data][:attributes][:field_value] = 'invalid_float'

    result = contract.call(invalid_params, { params: invalid_params })

    expect(result.failure?).to be_truthy
    expect(
      result.errors.to_hash.dig(:data, :attributes, :field_value)
    ).to include(I18n.t('dry_errors.errors.factors_norms.invalid_float'))
  end

  it 'fails when level is invalid' do
    invalid_params = valid_params.deep_dup
    invalid_params[:data][:attributes][:level] = 'InvalidLevel'

    result = contract.call(invalid_params, { params: invalid_params })

    expect(result.failure?).to be_truthy
    expect(result.errors.to_hash).to have_key(:level)
    expect(
      result.errors.to_hash[:level]
    ).to include(
      I18n.t('dry_errors.errors.factors_norms.invalid_level', levels: FactorsNorm::LEVELS.join(', '))
    )
  end

  it 'fails when field_name is invalid' do
    invalid_params = valid_params.deep_dup
    invalid_params[:data][:attributes][:field_name] = 'InvalidFieldName'

    result = contract.call(invalid_params, { params: invalid_params })

    expect(result.failure?).to be_truthy
    expect(result.errors.to_hash).to have_key(:field_name)
    expect(result.errors.to_hash[:field_name]).to include(I18n.t('dry_errors.errors.factors_norms.invalid_field_name'))
  end

  it 'fails when score_from is greater than or equal to score_to' do
    factors_norm.update(props: [{ 'level' => 'Low', 'score_to' => '5.00' }])

    invalid_params = valid_params.deep_dup
    invalid_params[:data][:attributes][:field_name] = 'score_from'
    invalid_params[:data][:attributes][:field_value] = '6.00'

    result = contract.call(invalid_params, { params: invalid_params })

    expect(result.failure?).to be_truthy
    expect(result.errors.to_hash).to have_key(:field_value)
    expect(result.errors.to_hash[:field_value]).to include(
      I18n.t('dry_errors.errors.factors_norms.score_from_less_than_score_to')
    )
  end

  it 'fails when score_to is less than or equal to score_from' do
    factors_norm.update(props: [{ 'level' => 'Low', 'score_from' => '3.00' }])

    invalid_params = valid_params.deep_dup
    invalid_params[:data][:attributes][:field_name] = 'score_to'
    invalid_params[:data][:attributes][:field_value] = '2.00'

    result = contract.call(invalid_params, { params: invalid_params })

    expect(result.failure?).to be_truthy
    expect(result.errors.to_hash).to have_key(:field_value)
    expect(result.errors.to_hash[:field_value]).to include(
      I18n.t('dry_errors.errors.factors_norms.score_to_greater_than_score_from')
    )
  end
end
