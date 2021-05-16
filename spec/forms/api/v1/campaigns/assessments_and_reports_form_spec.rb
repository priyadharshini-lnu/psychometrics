# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::Campaigns::AssessmentsAndReportsForm do
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { create(:report_family, reports: [report]) }
  let(:campaign) { create(:campaign) }
  let(:campaign_with_existed_assets) { create(:campaign, reports: [report], assessments: [assessment]) }

  it 'validates existed reports' do
    form = described_class.new({
      reports: [{ id: report.id, user_access: true, report_bundle_id: report_family.id }]
    }).with_context(campaign: campaign_with_existed_assets)
    expect(form.valid?).to eq(false)
    expect(form.errors[:reports]).to include("Report #{report.id} is already included to the campaign")
  end

  it 'validates existed assessments' do
    form = described_class.new({
      assessments: [{ id: assessment.id }]
    }).with_context(campaign: campaign_with_existed_assets)
    expect(form.valid?).to eq(false)
    expect(form.errors[:assessments]).to include("Assessment #{assessment.id} is already included to the campaign")
  end

  it 'validates assessments' do
    form = described_class.new({ report_bundle_id: report_family.id, assessments: [{ id: 1111 }] }).
           with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:assessments]).to include('[Assessment 1] Id Invalid assessment id')
  end

  it 'validates assessment norms' do
    form = described_class.new({
      reports: [{ id: report.id, user_access: true, report_bundle_id: report_family.id }],
      assessments: [{ id: assessment.id, norm_id: 1111 }]
    }).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:assessments]).to include('[Assessment 1] Norm Invalid norm id')
  end

  it 'validates reports' do
    form = described_class.new({
      reports: [{ id: 1111, user_access: true, report_bundle_id: report_family.id }]
    }).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:reports]).to include('[Report 1] Id Invalid report id')
  end

  context 'success' do
    before do
      create(:norm, dimension: assessment.dimension)
    end

    it 'validates passes if valid attributes are passed' do
      form = described_class.new({
        assessments: [{ id: assessment.id, norm_id: assessment.norms.first.id }],
        reports: [{ id: report.id, user_access: true, report_bundle_id: report_family.id }]
      }).with_context(campaign: campaign)

      expect(form.valid?).to eq(true)
    end
  end
end
