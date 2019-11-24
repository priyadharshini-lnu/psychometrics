# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::MergeMultipleEvaluatorEmailSchedules do
  let(:recipients) { create_list(:user, 2) }
  let(:subjects) { create_list(:user, 2) }
  let(:message_delivery) { double(deliver_later: nil) }

  it 'keeps only one email_schedule record and deletes rest if emails are consolidated' do
    email_schedules = create_list(
      :threesixty_email_schedule,
      2,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: true
    )

    described_class.call

    email_schedule_count = Threesixty::EmailSchedule.where(id: email_schedules.map(&:id)).count
    expect(email_schedule_count).to eq(1)
  end

  it 'keeps all email_schedules record if emails are not consolidated' do
    email_schedules = create_list(
      :threesixty_email_schedule,
      2,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: false
    )

    described_class.call

    email_schedule_count = Threesixty::EmailSchedule.where(id: email_schedules.map(&:id)).count
    expect(email_schedule_count).to eq(2)
  end

  it 'updates first email_schedule record with subject_ids from all other email_schedule record with same recipient' do
    email_schedules = []
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: true,
      meta: { 'subject_ids' => subjects[0].id }
    )
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: true,
      meta: { 'subject_ids' => subjects[1].id }
    )

    described_class.call

    expect(email_schedules[0].reload.meta).to eq('subject_ids' => subjects.map(&:id))
  end

  it "doesn't merge emails with different recipient_ids" do
    email_schedules = []
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: true
    )
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[1].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: true
    )

    described_class.call

    email_schedule_count = Threesixty::EmailSchedule.where(id: email_schedules.map(&:id)).count
    expect(email_schedule_count).to eq(2)
  end

  it "doesn't merge different emails together" do
    email_schedules = []
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: true
    )
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_INVITE,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: true
    )

    described_class.call

    email_schedule_count = Threesixty::EmailSchedule.where(id: email_schedules.map(&:id)).count
    expect(email_schedule_count).to eq(2)
  end

  it "doesn't merge non auto_triggered and delivered emails" do
    email_schedules = []
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: true,
      auto_triggered: false
    )
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: true,
      delivered_at: Time.now
    )
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_INVITE,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: -1),
      consolidated: true
    )

    described_class.call

    email_schedule_count = Threesixty::EmailSchedule.where(id: email_schedules.map(&:id)).count
    expect(email_schedule_count).to eq(3)
  end

  it "doesn't merge emails with scheduled_date of future" do
    email_schedules = []
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: 1),
      consolidated: true
    )
    email_schedules << create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now.advance(days: 1),
      consolidated: true,
      delivered_at: Time.now
    )

    email_schedule_count = Threesixty::EmailSchedule.where(id: email_schedules.map(&:id)).count
    expect(email_schedule_count).to eq(2)
  end
end
