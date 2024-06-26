# frozen_string_literal: true

require 'rails_helper'

describe Users::Registration::WithSmsInviteCode do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }
  let!(:sms_invite) { create(:sms_invite, campaign: campaign, code: 'abc') }
  let(:form) do
    Users::Registration::WithSmsInviteCodeForm.new({
      first_name: 'James',
      last_name: 'Smith',
      email: Faker::Internet.email,
      sms_invite_code: 'abc',
      mobile_number: '+911234567890',
      mobile_verified: true
    })
  end

  it 'creates user and adds it to appropriate campaign' do
    described_class.call!(form, project)
    user = User.find_by(email: form.email)

    expect(user).to_not eq(nil)
    expect(user.first_name).to eq(form.first_name)
    expect(user.last_name).to eq(form.last_name)
    expect(user.campaigns.exists?(id: campaign.id)).to eq(true)
    expect(user.mobile_number).to eq(form.mobile_number)
    expect(user.mobile_verified).to eq(form.mobile_verified)
  end

  it 'updates status and registered_user for sms_invite record' do
    described_class.call!(form, project)
    sms_invite.reload

    expect(sms_invite.registered?).to eq(true)
    expect(sms_invite.registered_user.email).to eq(form.email)
  end
end
