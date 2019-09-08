# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::SendScheduledEmails do
  it 'calls SendSingleScheduleEmail for each email_schedule record which is not delivered yet' do
    not_delivered_email_schedule = create_list(
      :threesixty_email_schedule,
      2,
      scheduled_date: Time.now.advance(days: -1),
      delivered_at: nil
    )
    delivered_email = create(:threesixty_email_schedule, delivered_at: Time.now, scheduled_date: Time.now.advance(days: -1))
    scheduled_for_future_email = create(:threesixty_email_schedule, delivered_at: Time.now, scheduled_date: Time.now.advance(days: 1))

    expect(Threesixty::Emails::SendSingleScheduledEmail).to receive(:call!).
      with(not_delivered_email_schedule[0])
    expect(Threesixty::Emails::SendSingleScheduledEmail).to receive(:call!).
      with(not_delivered_email_schedule[1])
    expect(Threesixty::Emails::SendSingleScheduledEmail).to_not receive(:call!).
      with(delivered_email)
    expect(Threesixty::Emails::SendSingleScheduledEmail).to_not receive(:call!).
      with(scheduled_for_future_email)

    described_class.call!
  end
end
