# frozen_string_literal: true

require 'rails_helper'

describe Users::Registration::WithSmsInviteCodeForm do
  let(:project) { create(:project) }
  let(:valid_attrs) do
    {
      first_name: 'James',
      last_name: 'Smith',
      email: Faker::Internet.email,
      sms_invite_code: 'abc'
    }
  end

  it 'validates if sms_invite_code is passed' do
    form = described_class.new(valid_attrs.merge(sms_invite_code: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors.messages[:sms_invite_code]).to include("can't be blank")
  end

  it 'validates is sms_invite_code record is present in database' do
    form = described_class.new(valid_attrs.merge(sms_invite_code: 'xyz')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors.messages[:sms_invite_code]).to include('SMS Invite code is invalid')
  end

  it 'validates sms_invite_code for expiry' do
    campaign = create(:campaign, project: project)
    create(:sms_invite, campaign: campaign, code: 'abc', expiry: 1.day.ago)
    form = described_class.new(valid_attrs.merge(sms_invite_code: 'abc')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors.messages[:sms_invite_code]).to include('SMS Invite code is invalid')
  end

  it 'returns invalid is someone has already registered using th sms_invite_code' do
    campaign = create(:campaign, project: project)
    create(:sms_invite, campaign: campaign, code: 'abc', expiry: 5.days.from_now, status: :registered)
    form = described_class.new(valid_attrs.merge(sms_invite_code: 'abc')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors.messages[:sms_invite_code]).to include('SMS Invite code is invalid')
  end

  it 'valid? returns true is sms_invite_code is present and is not expired' do
    campaign = create(:campaign, project: project)
    create(:sms_invite, campaign: campaign, code: 'abc', expiry: 5.days.from_now)
    form = described_class.new(valid_attrs.merge(sms_invite_code: 'abc')).with_context(project: project)

    expect(form.valid?).to eq(true)
  end
end
