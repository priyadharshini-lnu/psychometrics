require 'rails_helper'

describe Campaigns::Duplicate do

  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client, id: 101) }
  let!(:campaign) { create(:campaign, parent: project, id: 102) }
  let(:assessment) { create(:assessment, :with_report, name: 'Super Assessment') }
  let(:report) { assessment.reports.first }
  let!(:clients_report) { create(:clients_report, client: campaign, report: report, report_family: create(:report_family)) }


  before do
    campaign.assessments = [assessment]
    campaign.clients_reports = [clients_report]
  end

  describe 'broadcast ok' do
    let(:valid_form) { Rectify::StubForm.new(valid?: true, name: "Keep calm") }

    it do
      events = described_class.call(valid_form, campaign)
      new_campaign   = events[:ok]
      expect(new_campaign.name).to eq "Keep calm"
      expect(new_campaign.assessments.first.name).to eq 'Super Assessment'
      expect(new_campaign.reports.first.name).to eq report.name
      expect(new_campaign.clients_reports.first.report_family_id).to eq campaign.clients_reports.first.report_family_id
      expect(campaign.assessments.first.name).to eq 'Super Assessment'
      expect(campaign.reports.first.name).to eq report.name
    end
  end
end
