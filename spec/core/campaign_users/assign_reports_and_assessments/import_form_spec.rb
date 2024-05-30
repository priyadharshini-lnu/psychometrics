# frozen_string_literal: true

require 'rails_helper'

describe CampaignUsers::AssignReportsAndAssessments::ImportForm do
  let(:campaign) { create(:campaign) }
  let!(:assessment) { create(:assessment) }
  let!(:report) { create(:report, assessments: [assessment]) }
  let!(:bundle) { report.report_families.first }
  let!(:extra_report) { create(:report) }
  let!(:extra_assessment) { create(:assessment) }
  let!(:norm) { create(:norm) }
  let!(:user) { create(:user, email: 'john@cc.com') }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:license) do
    create(:license, client: campaign.client, report_family_id: bundle.id, type: 'common')
  end

  let(:import_data) do
    [
      ['Email', 'Report Bundle Id', 'Report Id', 'Assessment Id', 'Norm Id'],
      {
        email: 'John@cc.com',
        report_bundle_id: bundle.id,
        report_id: report.id,
        assessment_id: assessment.id,
        norm_id: norm.id
      }
    ]
  end

  it 'validates invalid headers' do
    import_data[0][0] = 'Invalid'
    form = described_class.new(import_data: import_data).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:import_data]).to include('Invalid header, take header from sample file')
  end

  it 'invalid report_id' do
    import_data[1][:report_id] = extra_report.id
    form = described_class.new(import_data: import_data).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:import_data]).to include("Row 1: Assessment with id #{assessment.id} is not part of report with id #{extra_report.id}") # rubocop:disable Layout/LineLength
    expect(form.errors[:import_data]).to include("Row 1: Report with id #{extra_report.id} is not part of report bundle with id #{report.report_families.first.id}") # rubocop:disable Layout/LineLength
  end

  it 'invalid assessment_id' do
    import_data[1][:assessment_id] = extra_assessment.id
    form = described_class.new(import_data: import_data).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:import_data]).to include("Row 1: Assessment with id #{extra_assessment.id} is not part of report with id #{report.id}") # rubocop:disable Layout/LineLength
  end

  it 'invalid license' do
    license.destroy
    form = described_class.new(import_data: import_data).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:import_data]).to include("Bundle with id #{bundle.id} doesn't have licenses")
  end

  it 'validates valdid headers' do
    form = described_class.new(import_data: import_data).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(true)
  end

  it 'passes all validations' do
    form = described_class.new(import_data: import_data).with_context(campaign: campaign, current_user: user)
    expect(form.valid?).to eq(true)
  end
end
