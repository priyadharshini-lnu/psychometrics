# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::EmailTemplates::Load do
  let(:threesixty_campaign) { create(:threesixty_campaign) }

  describe '.call' do
    it 'loads all email_templates for campaign' do
      template_loader = described_class.new(threesixty_campaign)
      email_templates_attributes = [
        {
          'from' => 'jamaes',
          'name' => 'subject_invite',
          'category' => 'invitations',
          'reply_to_email' => 'james@cc.com',
          'subject' => 'Subject1',
          'schedulable' => true,
          'content' => 'Content1'
        },
        {
          'from' => 'Smith',
          'name' => 'evaluator_invite',
          'category' => 'invitations',
          'reply_to_email' => 'smith@cc.com',
          'subject' => 'Subject2',
          'schedulable' => false,
          'content' => 'Content2'
        }
      ]
      allow(template_loader).to receive(:read_yaml).and_return(email_templates_attributes)

      template_loader.call

      expect(threesixty_campaign.email_templates).to have_attributes(email_templates_attributes)
    end
  end
end
