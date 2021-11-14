# frozen_string_literal: true

require 'rails_helper'

describe SmsInvites::Form do
  let(:campaign) { create(:campaign) }
  let(:valid_args) { attributes_for(:sms_invite) }

  it 'validates presence of first_name, last_name and mobile_no' do
    form = described_class.new(
      first_name: '',
      last_name: nil
    ).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:first_name]).to include("First name can't be blank")
    expect(form.errors[:last_name]).to include("Last name can't be blank")
    expect(form.errors[:mobile_no]).to include("Mobile number can't be blank")
  end

  it 'validates if passed locales are allowed mobile_no' do
    form = described_class.new(valid_args.merge(locale: 'xyz')).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:locale]).to include('Wrong locale.')
  end

  it 'validates mobile_no format' do
    form = described_class.new(valid_args.merge(mobile_no: '123')).with_context(campaign: campaign)
    expect(form.valid?).to eq(false)
    expect(form.errors[:mobile_no]).to include(
      'Mobile number should start with plus, followed by international code and then the number'
    )

    form = described_class.new(valid_args.merge(mobile_no: '123456789')).with_context(campaign: campaign)
    expect(form.valid?).to eq(false)

    form = described_class.new(valid_args.merge(mobile_no: '+91123456789')).with_context(campaign: campaign)
    expect(form.valid?).to eq(true)
  end

  it 'validate if invite with same mobile_no already exists' do
    mobile_no = '+911234567890'

    create(:sms_invite, campaign: campaign, mobile_no: mobile_no)
    form = described_class.new(valid_args.merge(mobile_no: mobile_no)).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:mobile_no]).to include('SMS Invite with same mobile number already exists')
  end

  it 'valid? returns true for valid record' do
    form = described_class.new(valid_args).with_context(campaign: campaign)

    expect(form.valid?).to eq(true)
  end
end
