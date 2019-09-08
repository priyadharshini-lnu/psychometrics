# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::SendSingleScheduledEmail do
  let(:recipients) { create_list(:user, 2) }
  let(:message_delivery) { double(deliver_later: nil) }

  it "doesn't send scheduled email if scheduled_date more then current time" do
    email_schedule = create(
      :threesixty_email_schedule,
      recipient_ids: recipients.map(&:id),
      scheduled_date: Time.now.advance(days: 2)
    )

    expect(Threesixty::ScheduleEmailMailer).to_not receive(:send_email)
    described_class.call!(email_schedule)
  end

  it 'sents schedule email to all recipients' do
    email_schedule = create(
      :threesixty_email_schedule,
      recipient_ids: recipients.map(&:id),
      scheduled_date: Time.now
    )

    expect(Threesixty::ScheduleEmailMailer).to receive(:send_email).
      with(email_schedule, recipient: recipients[0], threesixty_campaign: email_schedule.threesixty_campaign).
      and_return(message_delivery)
    expect(Threesixty::ScheduleEmailMailer).to receive(:send_email).
      with(email_schedule, recipient: recipients[1], threesixty_campaign: email_schedule.threesixty_campaign).
      and_return(message_delivery)

    described_class.call!(email_schedule)
  end

  it 'sents multiple email to recipients if there are multiple subject_ids' do
    subjects = create_list(:user, 2)

    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now,
      meta: { subject_ids: subjects.map(&:id) }
    )

    expect(Threesixty::ScheduleEmailMailer).to receive(:send_email).
      with(
        email_schedule,
        recipient: recipients[0],
        threesixty_campaign: email_schedule.threesixty_campaign,
        evaluator: recipients[0],
        subject: subjects[0]
      ).
      and_return(message_delivery)

    expect(Threesixty::ScheduleEmailMailer).to receive(:send_email).
      with(
        email_schedule,
        recipient: recipients[0],
        threesixty_campaign: email_schedule.threesixty_campaign,
        evaluator: recipients[0],
        subject: subjects[1]
      ).
      and_return(message_delivery)

    described_class.call!(email_schedule)
  end

  it 'sents multiple email to recipients if there are multiple evaluator_ids' do
    evaluators = create_list(:user, 2)

    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::SUBJECT_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now,
      meta: { evaluator_ids: evaluators.map(&:id) }
    )

    expect(Threesixty::ScheduleEmailMailer).to receive(:send_email).
      with(
        email_schedule,
        recipient: recipients[0],
        threesixty_campaign: email_schedule.threesixty_campaign,
        subject: recipients[0],
        evaluator: evaluators[0]
      ).
      and_return(message_delivery)

    expect(Threesixty::ScheduleEmailMailer).to receive(:send_email).
      with(
        email_schedule,
        recipient: recipients[0],
        threesixty_campaign: email_schedule.threesixty_campaign,
        subject: recipients[0],
        evaluator: evaluators[1]
      ).
      and_return(message_delivery)

    described_class.call!(email_schedule)
  end

  it 'create reminder history for reminder email and history is not present' do
    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now
    )

    described_class.call!(email_schedule)

    reminder_history = recipients[0].reminder_histories.first

    expect(reminder_history).to_not eq(nil)
    expect(reminder_history.sent_count).to eq(1)
    expect(reminder_history.last_sent_at).to be_within(4).of(Time.now)
  end

  it 'updates reminder history for reminder history and if history is present' do
    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now
    )

    reminder_history = recipients[0].reminder_histories.create(
      email_name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      threesixty_campaign: email_schedule.threesixty_campaign,
      sent_count: 1,
      last_sent_at: Time.now.advance(days: -2)
    )

    described_class.call!(email_schedule)

    reminder_history.reload
    expect(reminder_history.sent_count).to eq(2)
    expect(reminder_history.last_sent_at).to be_within(2.seconds).of(Time.now)
  end

  it 'sets delivered_at of email_schedule record' do
    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now
    )
    expect(email_schedule.delivered_at).to eq(nil)

    described_class.call!(email_schedule)

    expect(email_schedule.delivered_at).to be_within(2).of(Time.now)
  end
end
