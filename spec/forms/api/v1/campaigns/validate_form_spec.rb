# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::Campaigns::ValidateForm do
  let(:valid_attributes) do
    {
      id: 1,
      active: true,
      external_id: nil,
      existing_record: 'add_with_existing_response'
    }
  end
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  it 'validates id' do
    form = described_class.new({ id: nil })

    expect(form.valid?).to eq(false)
    expect(form.errors[:id]).to include('can\'t be blank')
  end

  it 'validates active' do
    form = described_class.new({ active: nil })

    expect(form.valid?).to eq(false)
    expect(form.errors[:active]).to include('is not included in the list')
  end

  it 'validates existing_record' do
    form = described_class.new({ existing_record: 'invalid' })

    expect(form.valid?).to eq(false)
    expect(form.errors[:existing_record]).to include('is not included in the list')
  end

  it 'validates external_id' do
    form = described_class.new(valid_attributes.merge(external_id: 'external_id'))

    expect(form.valid?).to eq(true)
  end

  it 'validates external_id is already taken by another user in same campaign' do
    user1 = create(:user)
    create(:campaign_user, campaign: campaign, external_id: 'external_id', user: user)
    form = described_class.new(
      valid_attributes.merge(
        id: campaign.id,
        external_id: 'external_id'
      )
    ).with_context(user: user1)

    expect(form.valid?).to eq(false)
    expect(form.errors[:external_id]).to include(
      I18n.t(
        'administration.api.campaigns.validate_form.external_id_taken',
        external_id: 'external_id'
      )
    )
  end

  it 'allows external_id to be taken by same user in same campaign' do
    create(:campaign_user, campaign: campaign, external_id: 'external_id', user: user)
    form = described_class.new(valid_attributes.merge(external_id: 'external_id')).with_context(user: user)

    expect(form.valid?).to eq(true)
  end

  it 'validates passes if valid attributes are passed' do
    form = described_class.new(valid_attributes)

    expect(form.valid?).to eq(true)
  end
end
