# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Options::ParticipantOptionForm do
  it 'validates boolean fields' do
    form = described_class.
      new(evaluator: {can_decline_nomination: "not_a_boolean_value"})
    form.validate

    expect(form.errors.messages[:evaluator]).to include("doesn't have a valid value")
  end

  it 'validates operator in criteria' do
    form = described_class.
      new(subject: {self_evaluation_criteria: [{'comparator': 'invalid_comparator' }]}).
      with_context(datasheet_column_names: [])
    form.validate

    expect(form.errors.messages[:subject]).to include("has invalid comparator")
  end

  it 'validates field in criteria' do
    form = described_class.
      new(subject: {self_evaluation_criteria: [{'field': 'invalid_field' }]}).
      with_context(datasheet_column_names: ['valid_field'])
    form.validate

    expect(form.errors.messages[:subject]).to include("has invalid conditional field")
  end

  it 'adds error when wrong criteria key is passed' do
    form = described_class.
      new(subject: {self_evaluation_criteria: [{'invalid_field_name': 'value' }]}).
      with_context(datasheet_column_names: [])
    form.validate

    expect(form.errors.messages[:subject]).to include("has invalid key")
  end

  it 'returns valid? as true if all values passed are valid' do
    form = described_class.
      new(subject: {self_evaluation_criteria: [{'field': 'valid_field', comparator: 'equal', value: 'value' }]}).
        with_context(datasheet_column_names: ['valid_field'])

    expect(form.valid?).to eq(true)
  end
end
