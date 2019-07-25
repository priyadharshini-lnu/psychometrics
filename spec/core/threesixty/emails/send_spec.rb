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

    expect {
      Threesixty::Emails::Send.call!('subject_report_ready', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    }.to_not change { Threesixty::EmailSchedule.count }
  end

  it 'creates email_schedules record when condition_class evaluatues condition to be true' do
    create(:threesixty_email_template, threesixty_campaign: threesixty_campaign, name: 'subject_report_ready')
    allow(Threesixty::Emails::IsSubjectReportReadySendable).to receive(:call!).and_return(true)

    expect {
      Threesixty::Emails::Send.call!('subject_report_ready', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    }.to change { Threesixty::EmailSchedule.count }.by(1)
  end

  it "email_schedules record created by copying attributes from email template" do
    email_template = create(:threesixty_email_template, threesixty_campaign: threesixty_campaign, name: 'subject_report_ready')
    allow(Threesixty::Emails::IsSubjectReportReadySendable).to receive(:call!).and_return(true)

    Threesixty::Emails::Send.call!('subject_report_ready', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)

    email_schedule = Threesixty::EmailSchedule.find_by(name: 'subject_report_ready')
    attributes_copied = %i(from reply_to_email content name)
    attributes_copied.each do |attribute|
      expect(email_schedule[attribute]).to eq(email_schedule[attribute])
    end
  end

  it "creates multiple email_schedules records when recipeint is manager" do
    create(:threesixty_email_template, threesixty_campaign: threesixty_campaign, name: 'manager_report_ready')
    manager_relationship = create(:relationship, name: 'Manager')
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

    expect {
      Threesixty::Emails::Send.call!('manager_report_ready', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    }.to change { Threesixty::EmailSchedule.count }.by(2)

    recipient_emails = Threesixty::EmailSchedule.where(name: "manager_report_ready").pluck(:recipient_emails).flatten
    expect(manager_evaluators.map(&:email)).to match_array(recipient_emails)
  end

  it "creates multiple email_schedules records when recipeint is evaluators_with_pending_evaluations" do
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

    expect {
      Threesixty::Emails::Send.call!('evaluator_reminder', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)
    }.to change { Threesixty::EmailSchedule.count }.by(2)

    recipient_emails = Threesixty::EmailSchedule.where(name: "evaluator_reminder").pluck(:recipient_emails).flatten
    expect(evaluators.map(&:email)).to match_array(recipient_emails)
  end

  it "it substitutes pipetext with the value that need to be sent via email" do
    create(
      :threesixty_email_template,
      threesixty_campaign: threesixty_campaign,
      name: 'subject_report_ready',
      content: 'Email: {{s://Field/Email}}'
    )
    allow(Threesixty::Emails::IsSubjectReportReadySendable).to receive(:call!).and_return(true)

    Threesixty::Emails::Send.call!('subject_report_ready', threesixty_campaign: threesixty_campaign, subject: threesixty_subject)

    email_schedule = Threesixty::EmailSchedule.find_by(name: 'subject_report_ready')
    expect(email_schedule.content).to eq("Email: #{threesixty_subject.email}")
  end
end
