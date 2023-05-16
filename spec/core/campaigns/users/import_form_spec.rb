# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::ImportForm do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let(:attrs) do
    { import_data: [
      UserDecorator.export_headers,
      {
        active: true,
        first_name: 'Vlad',
        last_name: 'Ata',
        email: 'vlad@gmail.com',
        password: nil,
        created_at: '11 Jul 2020 / 17:25'
      }
    ], operation: 'add_and_allow_new_response' }
  end
  let(:invalid_user_attrs) do
    { import_data: [
      UserDecorator.export_headers,
      {
        active: true,
        first_name: 'Vlad',
        last_name: 'Ata',
        email: nil,
        password: nil,
        created_at: '11 Jul 2020 / 17:25'
      }
    ], operation: 'add_and_allow_new_response' }
  end

  let(:user_attributes) { attrs.except(:operation) }

  it 'validates presence of proper operation' do
    form = described_class.new(attrs.merge(operation: 'wrong')).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:operation]).to include('is not included in the list')
  end

  it 'validates header' do
    form = described_class.new(attrs.merge(import_data: [%w[A B]])).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:import_data]).to include('Invalid header, take header from export')
  end

  it 'passes when a few users to be updated' do
    campaign.users.create(email: 'vlad@gmail.com', password: 'asdasd')
    form = described_class.new(attrs).with_context(campaign: campaign, current_user: user)
    expect(form.valid?).to eq(true)
  end

  it 'passes all validations' do
    form = described_class.new(attrs).with_context(campaign: campaign, current_user: user)
    expect(form.valid?).to eq(true)
  end
end
