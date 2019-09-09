# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::SendSingleReminder do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let(:threesixty_subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }

  it 'creates email_schdule record when it match first reminder rule' do
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
      sent_count: 1,
      last_sent_at: Time.now.advance(days: -3)
    )

    expect do
      described_class.call!(email_template)
    end.to change { Threesixty::EmailSchedule.count }.by(1)
  end

  it 'creates email_schdule record when it match second reminder rule' do
    email_template = create(
      :threesixty_email_template,
      threesixty_campaign: threesixty_campaign,
      category: :reminders,
      name: Threesixty::Emails::Name::SUBJECT_REMINDER,
      meta: { 'reminder_rules' => [{ 'days' => 3, 'times' => 2 }, { 'days' => 2, 'times' => 3 }] }
    )
    create(
      :threesixty_reminder_history,
      threesixty_campaign: threesixty_campaign,
      email_name: Threesixty::Emails::Name::SUBJECT_REMINDER,
      user: threesixty_subject.user,
      sent_count: 2,
      last_sent_at: Time.now.advance(days: -2)
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
    end.to_not(change) { Threesixty::EmailSchedule.count }
  end

  it 'creates email_schedule with multiple subject_ids for evaluator reminders' do
    threesixty_evaluator = create(:threesixty_evaluator, campaign: threesixty_campaign.campaign)
    other_threesixty_subject = create(:threesixty_subject, campaign: threesixty_campaign.campaign)

    # Subject for which evaluation is pending
    threesixty_subjects = [threesixty_subject, other_threesixty_subject]
    threesixty_subjects.each do |threesixty_subject|
      create(
        :threesixty_participant,
        campaign_id: threesixty_campaign.campaign_id,
        subject_id: threesixty_subject.user_id,
        evaluator_id: threesixty_evaluator.user_id
      )
    end

    email_template = create(
      :threesixty_email_template,
      threesixty_campaign: threesixty_campaign,
      category: :reminders,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      meta: { 'reminder_rules' => [{ 'days' => 3, 'times' => 2 }] }
    )
    create(
      :threesixty_reminder_history,
      threesixty_campaign: threesixty_campaign,
      email_name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      user: threesixty_subject.user,
      sent_count: 3
    )

    described_class.call!(email_template)
    email_schedule = Threesixty::EmailSchedule.where(name: Threesixty::Emails::Name::EVALUATOR_REMINDER).last
    expect(email_schedule.meta['subject_ids']).to match_array(threesixty_subjects.map(&:user_id))
  end
end
