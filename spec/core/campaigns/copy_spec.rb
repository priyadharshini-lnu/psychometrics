# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Copy do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:campaign) { create(:campaign, project: project, name: 'Campaign') }
  let!(:assessment) { create(:assessment, :with_report, name: 'Assessment') }
  let!(:assessment2) { create(:assessment, :with_report, name: 'Assessment2') }
  let!(:report) { assessment.reports.first }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:campaign_assessment2) { create(:campaign_assessment, campaign: campaign, assessment: assessment2) }
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
      campaign_assessment.update(position: 2)
      campaign_assessment2.update(position: 1)

      form = Campaigns::CopyForm.from_params(campaign.attributes.merge(name: "Copy - #{campaign.name}"))
      new_campaign = described_class.call!(form, campaign)
      expect(new_campaign.name).to eq 'Copy - Campaign'
      expect(new_campaign.assessments.first.id).to eq assessment.id
      expect(new_campaign.assessments.first.name).to eq assessment.name
      expect(new_campaign.campaign_assessments.first).to_not eq campaign_assessment
      expect(new_campaign.campaign_assessments.find_by(assessment_id: assessment.id).position).to eq 2
      expect(new_campaign.campaign_assessments.find_by(assessment_id: assessment2.id).position).to eq 1

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

  it 'copies all campaign factors and groups, preserving order and settings, but does not copy participants' do
    group1 = create(:campaign_factor_group, campaign: campaign, name: 'Group 1', position: 1)
    group2 = create(:campaign_factor_group, campaign: campaign, name: 'Group 2', position: 2)
    create(:campaign_factor, campaign: campaign, campaign_factor_group: group1, name: 'Factor 1',
position: 1, factor_type: 'formula', output_type: :numeric)
    create(:campaign_factor, campaign: campaign, campaign_factor_group: group1, name: 'Factor 2',
position: 2, factor_type: 'formula', output_type: :string)
    create(:campaign_factor, campaign: campaign, campaign_factor_group: group2, name: 'Factor 3',
position: 1, factor_type: 'assessment', output_type: :numeric)
    create(:campaign_user, campaign: campaign)

    form = Campaigns::CopyForm.from_params(campaign.attributes.merge(name: 'Copied Campaign',
                                                                     copy_campaign_factors: true))
    new_campaign = described_class.call!(form, campaign)

    expect(new_campaign.name).to eq 'Copied Campaign'
    expect(new_campaign.campaign_factor_groups.count).to eq 2
    expect(new_campaign.campaign_factors.count).to eq 3

    # Check group order and names
    expect(new_campaign.campaign_factor_groups.order(:position).pluck(:name)).to eq ['Group 1', 'Group 2']
    # Check factor order and names within groups
    group1_new = new_campaign.campaign_factor_groups.find_by(name: 'Group 1')
    group2_new = new_campaign.campaign_factor_groups.find_by(name: 'Group 2')
    expect(group1_new.campaign_factors.order(:position).pluck(:name)).to eq ['Factor 1', 'Factor 2']
    expect(group2_new.campaign_factors.order(:position).pluck(:name)).to eq ['Factor 3']

    # Check factor types and output types
    expect(group1_new.campaign_factors.find_by(name: 'Factor 1').factor_type).to eq 'formula'
    expect(group1_new.campaign_factors.find_by(name: 'Factor 2').output_type).to eq 'string'
    expect(group2_new.campaign_factors.find_by(name: 'Factor 3').factor_type).to eq 'assessment'

    # No participants copied
    expect(new_campaign.campaign_users.count).to eq 0
  end

  it 'copies sequencing group name translations' do
    sequencing_group = create(:campaign_assessment_group, campaign: campaign, name: 'Group EN')
    campaign_assessment.update!(campaign_assessment_group: sequencing_group)

    Mobility.with_locale('en') do
      campaign.update!(name: 'Campaign EN')
    end

    Mobility.with_locale('ar') do
      sequencing_group.update!(name: 'Group AR')
      campaign.update!(name: 'Campaign AR')
    end

    form = Campaigns::CopyForm.from_params(campaign.attributes.merge(name: 'Copied Campaign'))
    new_campaign = described_class.call!(form, campaign)

    copied_group = new_campaign.campaign_assessment_groups.find_by(position: sequencing_group.position)
    expect(copied_group).to be_present

    Mobility.with_locale('en') do
      expect(copied_group.name).to eq('Group EN')
      expect(new_campaign.name).to eq('Copied Campaign')
    end

    Mobility.with_locale('ar') do
      expect(copied_group.name).to eq('Group AR')
      expect(new_campaign.name).to eq('Campaign AR')
    end

    expect(new_campaign[:name]).to eq('Copied Campaign')
  end
end
