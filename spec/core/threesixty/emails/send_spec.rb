# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::Send do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_subject) do
    create(:threesixty_subject, campaign: threesixty_campaign.campaign)
  end

  it "doesn't create email_schedules record if condition_class evaluates condition to be false " do
    create(:threesixty_email_template, threesixty_campaign: threesixty_campaign, name: 'subject_report_ready')
    allow(Threesixty::Emails::IsSubjectReportReadySendable).to receive(:call!).and_return(false)

    expect do
      Threesixty::Emails::Send.call!('subject_report_ready',
                                     threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    end.to_not(change { Threesixty::EmailSchedule.count })
  end

  it 'creates email_schedules record when condition_class evaluatues condition to be true' do
    create(:threesixty_email_template, threesixty_campaign: threesixty_campaign, name: 'subject_report_ready')
    allow(Threesixty::Emails::IsSubjectReportReadySendable).to receive(:call!).and_return(true)

    expect do
      Threesixty::Emails::Send.call!('subject_report_ready',
                                     threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    end.to change { Threesixty::EmailSchedule.count }.by(1)
  end

  it 'email_schedules record created by copying attributes from email template' do
    create(:threesixty_email_template,
           threesixty_campaign: threesixty_campaign, name: 'subject_report_ready')
    allow(Threesixty::Emails::IsSubjectReportReadySendable).to receive(:call!).and_return(true)

    Threesixty::Emails::Send.call!('subject_report_ready',
                                   threesixty_campaign: threesixty_campaign, subject: threesixty_subject)

    email_schedule = Threesixty::EmailSchedule.find_by(name: 'subject_report_ready')
    attributes_copied = %i[from reply_to_email content name]
    attributes_copied.each do |attribute|
      expect(email_schedule[attribute]).to eq(email_schedule[attribute])
    end
  end

  it 'creates email_schedules record with multiple recipients when recipeint is manager' do
    create(:threesixty_email_template, threesixty_campaign: threesixty_campaign, name: 'manager_report_ready')
    manager_relationship = create(:relationship, name: 'Manager', type: :global)
    manager_evaluators = create_list(:threesixty_evaluator, 2, campaign_id: threesixty_campaign.campaign_id)
    manager_evaluators.each do |manager|
      create(
        :threesixty_participant,
        subject_id: threesixty_subject.user_id,
        campaign_id: threesixty_campaign.campaign_id,
        relationship: manager_relationship,
        evaluator: manager.user
      )
    end
    allow(Threesixty::Emails::IsManagerReportReadySendable).to receive(:call!).and_return(true)

    expect do
      Threesixty::Emails::Send.call!('manager_report_ready',
                                     threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    end.to change { Threesixty::EmailSchedule.count }.by(1)

    recipient_ids = Threesixty::EmailSchedule.find_by(name: 'manager_report_ready').recipient_ids
    expect(manager_evaluators.map(&:user_id)).to match_array(recipient_ids)
  end

  it 'creates email_schedules record with multiple recipients when recipeint is evaluators_with_pending_evaluations' do
    create(:threesixty_email_template, threesixty_campaign: threesixty_campaign, name: 'evaluator_reminder')
    create(:threesixty_option, threesixty_campaign: threesixty_campaign)
    evaluators = create_list(:threesixty_evaluator, 2, campaign_id: threesixty_campaign.campaign_id)
    evaluators.each do |evaluator|
      create(
        :threesixty_participant,
        subject_id: threesixty_subject.user_id,
        campaign_id: threesixty_campaign.campaign_id,
        evaluator: evaluator.user
      )
    end

    expect do
      Threesixty::Emails::Send.call!('evaluator_reminder',
                                     threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    end.to change { Threesixty::EmailSchedule.count }.by(1)

    recipient_ids = Threesixty::EmailSchedule.find_by(name: 'evaluator_reminder').recipient_ids
    expect(evaluators.map(&:user_id)).to match_array(recipient_ids)
  end

  it 'adds subject_ids in meta of email_schedule record' do
    create(
      :threesixty_email_template,
      threesixty_campaign: threesixty_campaign,
      name: 'subject_report_ready',
      content: 'Email: {{s://Field/Email}}'
    )
    allow(Threesixty::Emails::IsSubjectReportReadySendable).to receive(:call!).and_return(true)

    Threesixty::Emails::Send.call!('subject_report_ready',
                                   threesixty_campaign: threesixty_campaign, subject: threesixty_subject)

    email_schedule = Threesixty::EmailSchedule.find_by(name: 'subject_report_ready')
    expect(email_schedule.meta['subject_ids']).to match([threesixty_subject.user_id])
  end
end
