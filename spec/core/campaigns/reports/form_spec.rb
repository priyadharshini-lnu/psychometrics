# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Reports::Form do
  let(:attributes) { { report_family_id: 1, operation: 'skip_existing' } }

  it 'validates presence of report_family_id' do
    form = described_class.new(attributes.merge({ report_family_id: nil }))

    expect(form.valid?).to eq(false)
    expect(form.errors[:report_family_id]).to include("can't be blank")
  end

  it 'validation fails when wrong operation is passed' do
    form = described_class.new(attributes.merge(operation: 'wrong_operation'))

    expect(form.valid?).to eq(false)
    expect(form.errors[:operation]).to include('is not included in the list')
  end

  it 'validates passes if valid attributes are passed' do
    form = described_class.new(attributes)

    expect(form.valid?).to eq(true)
  end
end
