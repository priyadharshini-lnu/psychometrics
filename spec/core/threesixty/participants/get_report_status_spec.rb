require 'rails_helper'

describe Threesixty::Participants::GetReportStatus do
  let(:subject) { create(:threesixty_subject) }
  let(:option_which_requires_approval) { create(:threesixty_option, participants: { "manager" =>  { "can_approves_evaluations" => true } }) }
  let(:option_which_does_not_require_approval) { create(:threesixty_option) }

  describe 'report approval status denied' do
    let(:subject) { create(:threesixty_subject, report_approval_status: :denied) }

    it { expect(described_class.call!(subject, option_which_requires_approval)).to eq 'denied' }
  end
  describe 'report availability is false' do

    before { allow(Threesixty::Reports::IsAvailable).to receive(:call!).and_return(false) }
    it { expect(described_class.call!(subject, option_which_requires_approval)).to eq 'incomplete' }
  end
  describe 'report availability is true without required approval' do
    before { allow(Threesixty::Reports::IsAvailable).to receive(:call!).and_return(true) }
    it { expect(described_class.call!(subject, option_which_does_not_require_approval)).to eq 'available' }
  end
  describe 'report availability is true with required approval and approval status = approved' do
    let(:subject) { create(:threesixty_subject, report_approval_status: :approved) }

    before { allow(Threesixty::Reports::IsAvailable).to receive(:call!).and_return(true) }
    it { expect(described_class.call!(subject, option_which_requires_approval)).to eq 'approved' }
  end
end
