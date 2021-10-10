# frozen_string_literal: true

require 'rails_helper'

describe SmsInvites::ImportForm do
  let(:campaign) { create(:campaign) }

  it 'validates headers' do
    form = described_class.new(
      import_data:  [{
        'first_name' => 'James',
        'last_name' => 'Smith'
      }]
    ).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:import_data]).to include('Invalid header. Export SMS invite to get the correct headers')
  end

  it 'validates duplicate mobile_no' do
    form = described_class.new(
      import_data:  [{
        'first_name' => 'James',
        'last_name' => 'Smith',
        'mobile_no' => '+911234567890',
        'locale' => 'en'
      },
                     {
                       'first_name' => 'Jane',
                       'last_name' => 'Anderson',
                       'mobile_no' => '+911234567890',
                       'locale' => 'en'
                     }]
    ).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:import_data]).to include('The following mobile numbers are duplicated in CSV: +911234567890')
  end

  it 'validates individual sms_invite record' do
    form = described_class.new(
      import_data:  [{
        'first_name' => '',
        'last_name' => 'Smith',
        'mobile_no' => '+911234567890',
        'locale' => 'en'
      },
                     {
                       'first_name' => 'Jane',
                       'last_name' => '',
                       'mobile_no' => '+911234567891',
                       'locale' => 'en'
                     }]
    ).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:import_data]).to eq(["Row 1: First name can't be blank", "Row 2: Last name can't be blank"])
  end

  it 'valid? returns true for valid record' do
    form = described_class.new(
      import_data:  [{
        'first_name' => 'Jame',
        'last_name' => 'Smith',
        'mobile_no' => '+911234567890',
        'locale' => 'en'
      }]
    ).with_context(campaign: campaign)

    expect(form.valid?).to eq(true)
  end
end
