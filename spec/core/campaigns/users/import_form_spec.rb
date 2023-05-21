# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::ImportForm do
  let(:campaign) { create(:campaign) }
  let(:valid_attrs) do
    {
      active: true,
      first_name: 'Vlad',
      last_name: 'Ata',
      email: 'vlad@gmail.com',
      password: nil,
      schedule_start_date: 1.day.from_now.to_s,
      schedule_end_date: 2.days.from_now.to_s,
      created_at: '11 Jul 2020 / 17:25'
    }
  end
  let(:user) { create(:user) }

  let(:options) do
    { import_data: [
      UserDecorator.export_headers,
      valid_attrs
    ], operation: 'add_and_allow_new_response' }
  end

  let(:user_attributes) { attrs.except(:operation, :schedule_start_date, :schedule_end_date) }

  it 'validates dates are in proper format' do
    options = { import_data: [
      UserDecorator.export_headers,
      valid_attrs.merge(schedule_start_date: 'invalid_date', schedule_end_date: '30-30-10')
    ], operation: 'add_and_allow_new_response' }
    form = described_class.new(options).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors.full_messages).to include(
      'Import data Row 1: Schedule start date is invalid, Schedule end date is invalid'
    )
  end

  it 'validates presence of proper operation' do
    form = described_class.new(options.merge(operation: 'wrong')).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:operation]).to include('is not included in the list')
  end

  it 'validates header' do
    form = described_class.new(options.merge(import_data: [%w[A B]])).with_context(campaign: campaign,
                                                                                   current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:import_data]).to include('Invalid header, take header from export')
  end

  it 'passes when a few users to be updated' do
    campaign.users.create(email: 'vlad@gmail.com', password: 'asdasd')
    form = described_class.new(options).with_context(campaign: campaign, current_user: user)
    expect(form.valid?).to eq(true)
  end

  it 'passes all validations' do
    form = described_class.new(options).with_context(campaign: campaign, current_user: user)
    expect(form.valid?).to eq(true)
  end
end
