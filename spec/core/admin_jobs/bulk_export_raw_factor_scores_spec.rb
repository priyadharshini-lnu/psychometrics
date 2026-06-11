# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::BulkExportRawFactorScores do
  let(:campaign) { create(:campaign) }
  let!(:dimension) { create(:dimension, :with_factor) }
  let(:factor) { dimension.factors.first }
  let!(:assessment) { create(:assessment, :agile, dimension: dimension) }
  let(:subject_user) { create(:user) }
  let(:evaluator_user) { create(:user) }

  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: subject_user, active: true) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:user_assessment) do
    create(
      :user_assessment,
      subject: subject_user,
      assessment: assessment,
      campaign: campaign,
      status: :completed,
      completed_at: Time.zone.now,
      score_calculated: true,
      score_calculated_at: Time.zone.now
    )
  end
  let!(:users_result) do
    user_assessment.users_result.tap do |result|
      result.update_columns(
        scoring: {
          factor.id.to_s => {
            'score' => 2,
            'norm_score' => 1
          }
        }
      )
    end
  end

  let(:job_record) do
    create(
      :admin_job_record,
      operation: :bulk_export_raw_factor_scores,
      data: {
        campaign_id: campaign.id,
        assessment_ids: [assessment.id],
        start_date: 1.day.ago.iso8601,
        end_date: 1.day.from_now.iso8601,
        include_inactive_users: true
      }
    )
  end

  it 'exports workbook without Norm column and includes raw factor scores' do
    described_class.call!(job_record)

    tempfile = Tempfile.new(%w[bulk_export_raw .xlsx])
    tempfile.binmode
    tempfile.write(job_record.file.download)
    tempfile.rewind

    xlsx = Roo::Excelx.new(tempfile.path)
    header = xlsx.sheet(0).row(1)
    row = xlsx.sheet(0).row(2)

    expect(header).to include('Assessment ID', 'Assessment Name', 'Status', factor.name)
    expect(header).not_to include('Norm')
    expect(row).to include(assessment.id, assessment.name)
    expect(row.map(&:to_s)).to include('2')
  ensure
    tempfile&.close!
  end

  it 'is valid with required payload fields' do
    expect(described_class.new(job_record).valid?).to be true
  end
end
