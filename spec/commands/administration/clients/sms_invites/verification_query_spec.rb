# frozen_string_literal: true

require 'rails_helper'

describe Administration::Clients::SmsInvites::VerificationQuery do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let!(:sms_invite) { create(:sms_invite, campaign: campaign, code: '123456', expiry: 5.days.from_now) }
  let(:sms_invite_code) { '123456' }

  subject { described_class.new(project, sms_invite_code) }

  it 'returns the SMS invite with the given code that is not registered and not expired' do
    expect(subject.query).to eq(sms_invite)
  end

  it 'returns nil if the SMS invite is registered' do
    sms_invite.update(status: :registered)

    expect(subject.query).to eq(nil)
  end
end
