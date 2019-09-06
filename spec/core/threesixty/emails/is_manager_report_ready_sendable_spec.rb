# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::IsManagerReportReadySendable do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:subject) do
    create(:threesixty_subject, campaign: threesixty_campaign.campaign)
  end

  describe 'valid threesixty options for mail' do
    before do
      create(:threesixty_option,
        threesixty_campaign: threesixty_campaign,
        "reports" => {
          "access" => {
            "manager_can_access" => true,
          },
          "availability" => { "email_manager_when_report_available" => true },
          "approval" =>  {
            "administrator_approves_reports" => true
          }
        }
      )
    end

    it 'returns false if report availiablity conditions are not meet' do
      allow(Threesixty::Reports::ResolveReleaseCondition).to receive(:call!).and_return(false)

      expect(described_class.call!(threesixty_campaign: threesixty_campaign, subject: subject)).to eq false
    end

    it 'returns true if report availiablity conditions are meet' do
      allow(Threesixty::Reports::ResolveReleaseCondition).to receive(:call!).and_return(true)

      expect(described_class.call!(threesixty_campaign: threesixty_campaign, subject: subject)).to eq true
    end

  end

  describe 'invalid threesixty options for email' do
    it do
      create(:threesixty_option,
        threesixty_campaign: threesixty_campaign,
        "reports" => {
          "access" => {
            "manager_can_access" => true
          },
          "availability" => { "email_manager_when_report_available" => true },
          "approval" =>  {
            "administrator_approves_reports" => false
          }
        }
      )

      expect(described_class.call!(threesixty_campaign: threesixty_campaign, subject: subject)).to eq false
    end

    it do
      create(:threesixty_option,
        threesixty_campaign: threesixty_campaign,
        "reports" => {
          "access" => {
            "manager_can_access" => false
          },
          "availability" => { "email_manager_when_report_available" => true },
          "approval" =>  {
            "administrator_approves_reports" => true
          }
        }
      )

      expect(described_class.call!(threesixty_campaign: threesixty_campaign, subject: subject)).to eq false
    end
  end
end
