# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::SendReminders do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let(:threesixty_subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }

  it 'calls SendSingleReminder command for each reminder template' do
    reminder_email_templates = create_list(
      :threesixty_email_template,
      2,
      threesixty_campaign: threesixty_campaign,
      category: :reminders,
      name: Threesixty::Emails::Name::SUBJECT_REMINDER,
      meta: { "reminder_rules" => [{ "days" => 3, "times" => 2 }] }
    )
    non_reminder_email_template = create(:threesixty_email_template, category: :invitations)

    expect(Threesixty::Emails::SendSingleReminder).to receive(:call!)
      .with(reminder_email_templates[0])
    expect(Threesixty::Emails::SendSingleReminder).to receive(:call!)
      .with(reminder_email_templates[1])
    expect(Threesixty::Emails::SendSingleReminder).to_not receive(:call!)
      .with(non_reminder_email_template)

    described_class.call!
  end
end
