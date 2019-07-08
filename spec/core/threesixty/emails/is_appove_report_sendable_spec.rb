# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::IsApproveReportSendable do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:subject) do
    create(:threesixty_subject, campaign: threesixty_campaign.campaign)
  end

  describe 'valid threesixty options for mail' do
    before do
      create(:threesixty_option,
        threesixty_campaign: threesixty_campaign,
        "reports" => {
          "approval" =>  {
            "email_manager_when_report_ready_for_approval" => true, "manager_approves_reports" => true
            }
        }
      )
    end

    it 'returns false if report is already approved' do
      allow(subject).to receive(:report_approved?).and_return(true)

      expect(described_class.call!(threesixty_campaign, subject)).to eq false
    end

    it 'returns false if report availiablity conditions are not meet' do
      allow(Threesixty::Reports::ResolveReleaseCondition).to receive(:call!).and_return(false)

      expect(described_class.call!(threesixty_campaign, subject)).to eq false
    end

    it 'returns true if report availiablity conditions are meet' do
      allow(Threesixty::Reports::ResolveReleaseCondition).to receive(:call!).and_return(true)

      expect(described_class.call!(threesixty_campaign, subject)).to eq true
    end

  end

  describe 'invalid threesixty options for email' do
    before do
      create(:threesixty_option,
        threesixty_campaign: threesixty_campaign,
        "reports" => {
          "approval" =>  {
            "email_manager_when_report_ready_for_approval" => false
            }
        }
      )
    end

    it 'returns false' do
      expect(described_class.call!(threesixty_campaign, subject)).to eq false
    end
  end
end
