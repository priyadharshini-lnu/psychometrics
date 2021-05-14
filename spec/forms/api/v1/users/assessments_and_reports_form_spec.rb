# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::Users::AssessmentsAndReportsForm do
  let(:assessment) { create(:assessment) }
  let!(:norm) { create(:norm, dimension: assessment.dimension) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { create(:report_family, reports: [report]) }
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let(:user_with_existed_assets) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, user: user, campaign: campaign) }
  let(:campaign_user_with_existed_assets) { create(:campaign_user, user: user_with_existed_assets, campaign: campaign) }
  let!(:user_report) do
    create(:user_report, report: report, campaign: campaign, user: user_with_existed_assets)
  end
  let!(:user_assessment) do
    create(:user_assessment, assessment: assessment, campaign: campaign, subject: user_with_existed_assets)
  end

  it 'validates existed reports' do
    form = described_class.new({
      reports: [{ id: report.id, user_access: true, report_bundle_id: report_family.id }]
    }).with_context(campaign: campaign, campaign_user: campaign_user_with_existed_assets)
    expect(form.valid?).to eq(false)
    expect(form.errors[:reports]).to include("Report #{report.id} is already included to the campaign")
  end

  it 'validates existed assessments' do
    form = described_class.new({
      assessments: [{ id: assessment.id }]
    }).with_context(campaign: campaign, campaign_user: campaign_user_with_existed_assets)
    expect(form.valid?).to eq(false)
    expect(form.errors[:assessments]).to include("Assessment #{assessment.id} is already included to the campaign")
  end

  it 'validates passes if valid attributes are passed' do
    form = described_class.new({
      assessments: [{ id: assessment.id, norm_id: assessment.norms.first.id }],
      reports: [{ id: report.id, user_access: true, report_bundle_id: report_family.id }]
    }).with_context(campaign: campaign, campaign_user: campaign_user)

    expect(form.valid?).to eq(true)
  end
end
