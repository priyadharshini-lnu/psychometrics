# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::IsApproveNominationSendable do
  let(:threesixty_campaign) { create(:threesixty_campaign) }

  describe 'valid threesixty options for mail' do
    it do
      create(:threesixty_option,
             threesixty_campaign: threesixty_campaign,
             'participants' => {
               'subject' => { 'can_nominate_evaluators' => true },
               'manager' => { 'can_approve_nominations' => true, 'email_managers_on_nomination_approval' => true }
             })

      expect(described_class.call!(threesixty_campaign: threesixty_campaign)).to eq true
    end
  end

  describe 'invalid threesixty options for email' do
    it do
      create(:threesixty_option,
             threesixty_campaign: threesixty_campaign,
             'participants' => {
               'subject' => { 'can_nominate_evaluators' => false },
               'manager' => { 'can_approve_nominations' => true, 'email_managers_on_nomination_approval' => true }
             })

      expect(described_class.call!(threesixty_campaign: threesixty_campaign)).to eq false
    end

    it do
      create(:threesixty_option,
             threesixty_campaign: threesixty_campaign,
             'participants' => {
               'subject' => { 'can_nominate_evaluators' => true },
               'manager' => { 'can_approve_nominations' => false, 'email_managers_on_nomination_approval' => true }
             })

      expect(described_class.call!(threesixty_campaign: threesixty_campaign)).to eq false
    end
  end
end
