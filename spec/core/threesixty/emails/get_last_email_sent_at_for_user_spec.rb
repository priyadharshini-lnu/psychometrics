# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::GetLastEmailSentAtForUser do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_email_schedule) do
    create(:threesixty_email_schedule, name: ::Threesixty::Emails::Name::REQUEST_APPROVAL,
            threesixty_campaign_id: threesixty_campaign.id)
  end
  let(:user) { create(:user) }

  it 'returns last emails sent at time for particular user and email type' do
    last_sent_at = Time.now.advance(days: -1)
    create(:threesixty_email_history, threesixty_email_schedule_id: threesixty_email_schedule.id,
      subject_id: user.id, created_at: last_sent_at)

    result = described_class.call!(threesixty_campaign, ::Threesixty::Emails::Name::REQUEST_APPROVAL, user.id)

    expect(result).to eq(last_sent_at)
  end

  it "doesn't return last sent time if email of passed type is not sent" do
    last_sent_at = Time.now.advance(days: -1)
    create(:threesixty_email_history, threesixty_email_schedule_id: threesixty_email_schedule.id,
      subject_id: user.id, created_at: last_sent_at)

    result = described_class.call!(threesixty_campaign, ::Threesixty::Emails::Name::EVALUATOR_INVITE, user.id)

    expect(result).to eq(nil)
  end

  it "doesn't return last sent time if no email was not sent for passed user" do
    last_sent_at = Time.now.advance(days: -1)
    create(:threesixty_email_history, threesixty_email_schedule_id: threesixty_email_schedule.id,
      subject_id: create(:user).id, created_at: last_sent_at)

    result = described_class.call!(threesixty_campaign, ::Threesixty::Emails::Name::EVALUATOR_INVITE, user.id)

    expect(result).to eq(nil)
  end
end
