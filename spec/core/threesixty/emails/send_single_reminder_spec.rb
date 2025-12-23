# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::SendSingleReminder do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) do
    create(:threesixty_option,
           threesixty_campaign: threesixty_campaign,
           participants: { 'subject' => { 'can_evaluate_self' => true } })
  end
  let(:threesixty_subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }

  xit 'creates email_schdule record when it match first reminder rule' do
    email_template = create(
      :threesixty_email_template,
      threesixty_campaign: threesixty_campaign,
      category: :reminders,
      name: Threesixty::Emails::Name::SUBJECT_REMINDER,
      meta: { 'reminder_rules' => [{ 'days' => 3, 'times' => 2 }] }
    )
    create(:threesixty_participant,
           evaluator: threesixty_subject.user,
           subject: threesixty_subject.user,
           campaign: threesixty_campaign.campaign)
    create(
      :threesixty_reminder_history,
      threesixty_campaign: threesixty_campaign,
      email_name: Threesixty::Emails::Name::SUBJECT_REMINDER,
      user: threesixty_subject.user,
      sent_count: 1,
      last_sent_at: Time.zone.now.advance(days: -3)
    )

    expect do
      described_class.call!(email_template)
    end.to change { Threesixty::EmailSchedule.count }.by(1)
  end

  xit 'creates email_schdule record when it match second reminder rule' do
    email_template = create(
      :threesixty_email_template,
      threesixty_campaign: threesixty_campaign,
      category: :reminders,
      name: Threesixty::Emails::Name::SUBJECT_REMINDER,
      meta: { 'reminder_rules' => [{ 'days' => 3, 'times' => 2 }, { 'days' => 2, 'times' => 3 }] }
    )
    create(:threesixty_participant,
           evaluator: threesixty_subject.user,
           subject: threesixty_subject.user,
           campaign: threesixty_campaign.campaign)
    create(
      :threesixty_reminder_history,
      threesixty_campaign: threesixty_campaign,
      email_name: Threesixty::Emails::Name::SUBJECT_REMINDER,
      user: threesixty_subject.user,
      sent_count: 2,
      last_sent_at: Time.zone.now.advance(days: -2)
    )

    expect do
      described_class.call!(email_template)
    end.to change { Threesixty::EmailSchedule.count }.by(1)
  end

  it "doesn't creates email_schedule record when no reminder rule matches" do
    email_template = create(
      :threesixty_email_template,
      threesixty_campaign: threesixty_campaign,
      category: :reminders,
      name: Threesixty::Emails::Name::SUBJECT_REMINDER,
      meta: { 'reminder_rules' => [{ 'days' => 3, 'times' => 2 }] }
    )
    create(
      :threesixty_reminder_history,
      threesixty_campaign: threesixty_campaign,
      email_name: Threesixty::Emails::Name::SUBJECT_REMINDER,
      user: threesixty_subject.user,
      sent_count: 3
    )

    expect do
      described_class.call!(email_template)
    end.to_not(change { Threesixty::EmailSchedule.count })
  end
end
