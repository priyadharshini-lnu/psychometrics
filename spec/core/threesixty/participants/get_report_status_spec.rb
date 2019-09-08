# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Participants::GetReportStatus do
  let(:subject) { create(:threesixty_subject) }
  let(:option) do
    create(:threesixty_option,
           participants: { 'manager' => { 'can_approves_evaluations' => true } },
           reports: { 'access' => { 'self_can_access' => true } })
  end

  let(:option_which_does_not_require_approval) { create(:threesixty_option) }

  describe 'report on hold' do
    let(:subject) { create(:threesixty_subject, report_release_status: :on_hold) }

    it do
      expect(described_class.call!(subject, option, {})).to eq Threesixty::Participants::GetReportStatus::ON_HOLD
    end
  end

  it 'report not available' do
    subject = create(:threesixty_subject)
    option = create(:threesixty_option, participants: { 'access' => { 'self_can_access' => false } })
    expect(described_class.call!(subject, option, {})).to eq Threesixty::Participants::GetReportStatus::NOT_AVAILABLE
  end

  describe 'report availability is false' do
    before { allow(Threesixty::Reports::IsAvailable).to receive(:call!).and_return(false) }
    it { expect(described_class.call!(subject, option, {})).to eq Threesixty::Participants::GetReportStatus::INCOMPLETE }
  end

  describe 'report approved by manager' do
    let(:subject) { create(:threesixty_subject, report_approval_status: :approved) }
    it { expect(described_class.call!(subject, option, {})).to eq Threesixty::Participants::GetReportStatus::APPROVED }
  end
end
