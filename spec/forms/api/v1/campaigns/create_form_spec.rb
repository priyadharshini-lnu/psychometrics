# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::Campaigns::CreateForm do
  it 'validates status' do
    form = described_class.new({ status: 'invalid' })

    expect(form.valid?).to eq(false)
    expect(form.errors[:status]).to include('is not included in the list')
  end

  it 'validates duration' do
    form = described_class.new({ fixed_time: true })

    expect(form.valid?).to eq(false)
    expect(form.errors[:duration]).to include('can\'t be blank')
  end

  it 'validates end_date' do
    form = described_class.new({ start_date: '2021-03-06T17:20:43+04:00', end_date: '2020-03-06T17:20:43+04:00' })

    expect(form.valid?).to eq(false)
    expect(form.errors[:end_date]).to include('must be after the start date')
  end

  it 'validates passes if valid attributes are passed' do
    form = described_class.new({
      name: 'campaign',
      status: 'active',
      start_date: '2021-03-06T17:20:43+04:00',
      end_date: '2021-03-06T17:20:43+04:00',
      fixed_time: true,
      duration: 34_343,
      enable_instructions: true,
      instructions: '<div>111<div>'
    })

    expect(form.valid?).to eq(true)
  end
end
