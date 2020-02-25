# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::SendSingleScheduledEmail do
  let(:recipients) { create_list(:user, 2) }
  let(:user) { create(:user) }
  let(:message_delivery) { double(deliver_later: nil) }

  before do
    allow_any_instance_of(Threesixty::Campaign).to receive(:option).and_return(
      Threesixty::Option.new
    )
  end

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
      meta: { evaluator_ids: evaluators.map(&:id), subject_ids: 1 }
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
      scheduled_date: Time.now,
      meta: { 'subject_ids' => user.id }
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
      scheduled_date: Time.now,
      meta: { 'subject_ids' => user.id }
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

  it 'creates email history' do
    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now,
      meta: { 'subject_ids' => user.id }
    )

    create(
      :threesixty_participant,
      campaign_id: email_schedule.threesixty_campaign.campaign_id,
      evaluator_id: recipients[0].id
    )

    described_class.call!(email_schedule)

    email_history = email_schedule.email_histories.first

    expect(email_history).to_not eq(nil)
  end

  it 'sets relationship_id as meta data in reminder history' do
    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now
    )
    threesixty_subject = create(:threesixty_subject, campaign_id: email_schedule.threesixty_campaign.campaign_id)
    relationship = create(:relationship, name: 'Manager', type: :global)
    create(
      :threesixty_participant,
      campaign_id: email_schedule.threesixty_campaign.campaign_id,
      evaluator_id: recipients[0].id,
      subject_id: threesixty_subject.user_id,
      relationship_id: relationship.id
    )

    described_class.call!(email_schedule)

    email_history = email_schedule.email_histories.first

    expect(email_history.meta['relationship_id']).to eq(relationship.id)
  end

  it 'sends single email to evaluator if evaluator emails are consolidate' do
    subjects = create_list(:user, 2)
    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now,
      consolidated: true,
      meta: { subject_ids: subjects.map(&:id) }
    )
    create(
      :threesixty_participant,
      campaign_id: email_schedule.threesixty_campaign.campaign_id,
      evaluator_id: recipients[0].id,
      subject_id: subjects[0].id
    )
    create(
      :threesixty_participant,
      campaign_id: email_schedule.threesixty_campaign.campaign_id,
      evaluator_id: recipients[0].id,
      subject_id: subjects[1].id
    )

    expect(Threesixty::ScheduleEmailMailer).to receive(:send_email).
      once.with(email_schedule,
                hash_including(subject_ids: subjects.map(&:id))).and_return(message_delivery)

    described_class.call!(email_schedule)
  end

  it 'sends multiple email to evaluator if evaluator emails are not consolidate' do
    subjects = create_list(:user, 2)
    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now,
      consolidated: false,
      meta: { subject_ids: subjects.map(&:id) }
    )
    create(
      :threesixty_participant,
      campaign_id: email_schedule.threesixty_campaign.campaign_id,
      evaluator_id: recipients[0].id,
      subject_id: subjects[0].id
    )
    create(
      :threesixty_participant,
      campaign_id: email_schedule.threesixty_campaign.campaign_id,
      evaluator_id: recipients[0].id,
      subject_id: subjects[1].id
    )

    expect(Threesixty::ScheduleEmailMailer).to receive(:send_email).twice.and_return(message_delivery)

    described_class.call!(email_schedule)
  end

  it 'creates multiple email history record for consolidated emails' do
    subjects = create_list(:user, 2)
    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now,
      consolidated: true,
      meta: { subject_ids: subjects.map(&:id) }
    )
    manager_relationship = create(:relationship, name: 'Manager', type: :global)
    peer_relationship = create(:relationship, name: 'Peer', type: :global)
    create(
      :threesixty_participant,
      campaign_id: email_schedule.threesixty_campaign.campaign_id,
      evaluator_id: recipients[0].id,
      subject_id: subjects[0].id,
      relationship_id: manager_relationship.id
    )
    create(
      :threesixty_participant,
      campaign_id: email_schedule.threesixty_campaign.campaign_id,
      evaluator_id: recipients[0].id,
      subject_id: subjects[1].id,
      relationship_id: peer_relationship.id
    )

    described_class.call!(email_schedule)

    email_histories = email_schedule.email_histories

    expect(email_histories.length).to eq(2)
    expect(email_histories[0].subject_id).to eq(subjects[0].id)
    expect(email_histories[1].subject_id).to eq(subjects[1].id)
    expect(email_histories[0].meta['relationship_id']).to eq(manager_relationship.id)
    expect(email_histories[1].meta['relationship_id']).to eq(peer_relationship.id)
  end

  it 'sets condolidated as true in created email history if emails are consolidated' do
    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now,
      consolidated: true,
      meta: { 'subject_ids' => user.id }
    )
    create(
      :threesixty_participant,
      campaign_id: email_schedule.threesixty_campaign.campaign_id,
      evaluator_id: recipients[0].id
    )

    described_class.call!(email_schedule)

    email_history = email_schedule.email_histories.first

    expect(email_history.consolidated).to eq(true)
  end

  it 'sets consolidated as false in created email history if emails are not consolidatable' do
    email_schedule = create(
      :threesixty_email_schedule,
      name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
      recipient_ids: [recipients[0].id],
      scheduled_date: Time.now,
      consolidated: false,
      meta: { 'subject_ids' => user.id }
    )
    create(
      :threesixty_participant,
      campaign_id: email_schedule.threesixty_campaign.campaign_id,
      evaluator_id: recipients[0].id
    )

    described_class.call!(email_schedule)

    email_history = email_schedule.email_histories.first

    expect(email_history.consolidated).to eq(false)
  end
end
