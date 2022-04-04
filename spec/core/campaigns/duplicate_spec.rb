# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Duplicate do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, :with_report, name: 'Super Assessment') }
  let(:report) { assessment.reports.first }

  before do
    campaign.assessments = [assessment]
    campaign.reports = [report]
  end

  describe 'broadcast ok' do
    let(:valid_form) { Rectify::StubForm.new(valid?: true, name: 'Keep calm') }

    it do
      new_campaign = described_class.call!(valid_form, campaign)
      expect(new_campaign.name).to eq 'Keep calm'
      expect(new_campaign.assessments.first.name).to eq 'Super Assessment'
      expect(new_campaign.reports.first.name).to eq report.name
      expect(campaign.assessments.first.name).to eq 'Super Assessment'
      expect(campaign.reports.first.name).to eq report.name
    end
  end
end
