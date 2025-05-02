# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Copy do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:campaign) { create(:campaign, project: project, name: 'Campaign') }
  let!(:assessment) { create(:assessment, :with_report, name: 'Super Assessment') }
  let!(:report) { assessment.reports.first }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:campaign_report) { create(:campaign_report, campaign: campaign, report: report) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let!(:user_assessment) { create(:user_assessment, campaign: campaign, assessment: assessment) }
  let!(:user_report) { create(:user_report, campaign: campaign, report: report) }
  let!(:datasheet) { create(:datasheet, campaign: campaign) }
  let!(:datasheet_column) { create(:sheet_column, sheet: datasheet, name: 'col1') }
  let!(:sheet_row) { create(:sheet_row, sheet: datasheet) }
  let!(:sheet_row_datum) do
    create(:sheet_row_datum, sheet_row: sheet_row, sheet_column: datasheet_column, string_value: 'test')
  end

  describe 'broadcast ok' do
    it do
      form = Campaigns::CopyForm.from_params(campaign.attributes.merge(name: "Copy - #{campaign.name}"))
      new_campaign = described_class.call!(form, campaign)

      expect(new_campaign.name).to eq 'Copy - Campaign'
      expect(new_campaign.assessments.first.id).to eq assessment.id
      expect(new_campaign.assessments.first.name).to eq assessment.name
      expect(new_campaign.campaign_assessments.first).to_not eq campaign_assessment
      expect(new_campaign.reports.first.id).to eq report.id
      expect(new_campaign.reports.first.name).to eq report.name
      expect(new_campaign.campaign_reports.first).to_not eq campaign_report
      expect(campaign.user_assessments.size).to eq 1
      expect(campaign.user_reports.size).to eq 1
      expect(new_campaign.user_assessments.size).to eq 0
      expect(new_campaign.user_reports.size).to eq 0
      expect(campaign.datasheet.sheet_columns.map(&:name)).to eq ['col1']
      expect(campaign.datasheet.rows.size).to eq 1
      expect(new_campaign.datasheet.sheet_columns.map(&:name)).to eq ['col1']
      expect(new_campaign.datasheet.rows.size).to eq 0
    end
  end
end
