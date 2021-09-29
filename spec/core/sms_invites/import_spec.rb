# frozen_string_literal: true

require 'rails_helper'

describe SmsInvites::Import do
  let(:campaign) { create(:campaign) }
  let(:valid_args) { attributes_for(:sms_invite) }
  let(:job_record) { create(:admin_job_record, owner: create(:user)) }
  let(:rows) do
    [
      {
        first_name: 'James',
        last_name: 'Smith',
        mobile_no: '+9112345678',
        locale: 'en'
      },
      {
        first_name: 'Danny',
        last_name: 'Anderson',
        mobile_no: '+9112345679',
        locale: 'en'
      }
    ]
  end

  it 'create sms_invite records' do
    described_class.call!(campaign, rows, job_record)

    expect(campaign.sms_invites.length).to eq(2)
    sms_invites = campaign.sms_invites.map { |invite| invite.slice(:first_name, :last_name, :mobile_no, :locale) }
    expect(sms_invites).to match_array(rows)
  end

  it 'udates total_tasks of AdminJobRecord and increments completed count' do
    described_class.call!(campaign, rows, job_record)

    expect(job_record.total_tasks).to eq(2)
    expect(job_record.completed_tasks).to eq(2)
  end
end
