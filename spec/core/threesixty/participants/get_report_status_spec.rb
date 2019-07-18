require 'rails_helper'

describe Threesixty::Participants::GetReportStatus do
  let(:subject) { create(:threesixty_subject) }
  let(:option_which_requires_approval) { create(:threesixty_option, participants: { "manager" =>  { "can_approves_evaluations" => true } }) }
  let(:option_which_does_not_require_approval) { create(:threesixty_option) }

  describe 'report on hold' do
    let(:subject) { create(:threesixty_subject, report_release_status: :on_hold) }
    it { expect(described_class.call!(subject, option_which_requires_approval, {})).to eq 'on_hold' }
  end
  describe 'report availability is false' do
    before { allow(Threesixty::Reports::IsAvailable).to receive(:call!).and_return(false) }
    it { expect(described_class.call!(subject, option_which_requires_approval, {})).to eq 'incomplete' }
  end
  describe 'report approved by manager' do
    let(:subject) { create(:threesixty_subject, report_approval_status: :approved) }
    it { expect(described_class.call!(subject, option_which_requires_approval, {})).to eq 'approved' }
  end
end
