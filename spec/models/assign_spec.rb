require 'rails_helper'

RSpec.describe Assign, type: :model do
  let!(:membership) { create(:membership) }
  let!(:report) { membership.client.reports.first }
  let!(:license) { create(:license, client: membership.client.root, used_number: 0, report_family: report.report_families.take) }

  describe '#threesixty?' do
    let(:assign) { create(:assign, assessment: create(:assessment, category: :threesixty)) }
    before do
      allow_any_instance_of(Assign).to receive(:relevant_assessment).and_return(true)
    end

    it { expect(assign.threesixty?).to eq true }
  end

  describe '#threesixty_subject' do
    let(:campaign) { create(:campaign) }
    let(:subject) { create(:user) }
    let(:assign) { create(:assign, campaign: campaign, subject: subject) }
    let!(:threesixty_subject) {  create(:threesixty_subject, campaign: campaign, user: subject) }
    it { expect(assign.threesixty_subject.id).to eq threesixty_subject.id }
  end
end
