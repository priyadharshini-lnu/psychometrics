# frozen_string_literal: true

require 'rails_helper'

describe SmsInvites::SendSmsInvites do
  let(:sms_record) { create(:sms_record, message: 'Hi {{{first_name}}}', filters: { status_in: ['not_invited'] }) }
  let(:campaign) { sms_record.campaign }
  let(:job_record) { create(:admin_job_record, total_tasks: 0, completed_tasks: 0) }
  let!(:sms_invite) { create(:sms_invite, campaign: campaign, code: nil, expiry: nil) }

  before do
    allow(Sms::Send).to receive(:call!)
  end

  it 'updates sms_invite with code and expiry and mark status as invited' do
    described_class.call!(sms_record, job_record)
    sms_invite.reload

    expect(sms_invite.code).to_not eq(nil)
    expect(sms_invite.expiry).to eq(sms_record.link_expiry)
  end

  it 'replaces pipe text from sms message to send and sends out sms' do
    expect(Sms::Send).to receive(:call!).
      with(sms_invite.mobile_no, "Hi #{sms_invite.first_name}", hash_including(:status_callback))
    described_class.call!(sms_record, job_record)
  end

  it 'updates total_tasks and completed_tasts for admin_job_record' do
    create(:sms_invite, campaign: campaign)
    described_class.call!(sms_record, job_record)
    job_record.reload

    expect(job_record.total_tasks).to eq(2)
    expect(job_record.completed_tasks).to eq(2)
  end

  it 'only sends sms_invite to the filtered record using filters column in sms_record' do
    create(:sms_invite, campaign: campaign, status: :invited)
    expect(Sms::Send).to receive(:call!).once
    described_class.call!(sms_record, job_record)
    job_record.reload

    expect(job_record.total_tasks).to eq(1)
    expect(job_record.completed_tasks).to eq(1)
  end

  it 'create sms_history' do
    described_class.call!(sms_record, job_record)
    sms_history = sms_invite.sms_histories.last

    expect(sms_history).to_not eq(nil)
  end
end
