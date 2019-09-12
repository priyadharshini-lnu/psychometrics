# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::IsSubjectReportReadySendable do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:subject) do
    create(:threesixty_subject, campaign: threesixty_campaign.campaign)
  end

  describe 'valid threesixty options for mail' do
    before do
      create(:threesixty_option,
             threesixty_campaign: threesixty_campaign,
             'reports' => {
               'access' => {
                 'self_can_access' => true
               },
               'availability' => { 'email_subject_when_report_available' => true },
               'approval' => {
                 'manager_approves_reports' => true
               }
             })
    end

    it 'returns false if report is not available' do
      allow(Threesixty::Participants::GetReportStatus).to receive(:call!).
        and_return(Threesixty::Participants::GetReportStatus::NOT_AVAILABLE)

      expect(described_class.call!(threesixty_campaign: threesixty_campaign, subject: subject)).to eq false
    end

    it 'returns true if report is available' do
      allow(Threesixty::Participants::GetReportStatus).to receive(:call!).
        and_return(Threesixty::Participants::GetReportStatus::AVAILABLE)

      expect(described_class.call!(threesixty_campaign: threesixty_campaign, subject: subject)).to eq true
    end
  end

  describe 'invalid threesixty options for email' do
    before do
      create(:threesixty_option,
             threesixty_campaign: threesixty_campaign,
             'reports' => {
               'approval' => {
                 'email_manager_when_report_ready_for_approval' => false
               }
             })
    end

    it do
      create(:threesixty_option,
             threesixty_campaign: threesixty_campaign,
             'reports' => {
               'access' => {
                 'self_can_access' => true
               },
               'availability' => { 'email_subject_when_report_available' => true },
               'approval' => {
                 'manager_approves_reports' => false
               }
             })

      expect(described_class.call!(threesixty_campaign: threesixty_campaign, subject: subject)).to eq false
    end

    it do
      create(:threesixty_option,
             threesixty_campaign: threesixty_campaign,
             'reports' => {
               'access' => {
                 'self_can_access' => false
               },
               'availability' => { 'email_subject_when_report_available' => true },
               'approval' => {
                 'manager_approves_reports' => true
               }
             })

      expect(described_class.call!(threesixty_campaign: threesixty_campaign, subject: subject)).to eq false
    end
  end
end
