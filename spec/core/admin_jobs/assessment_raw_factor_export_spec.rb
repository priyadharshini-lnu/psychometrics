# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::AssessmentRawFactorExport do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let!(:dimension) { create(:dimension, :with_factor) }
  let(:factor) { dimension.factors.first }

  let!(:assessment) { create(:assessment, :agile, dimension_id: dimension.id) }
  let(:user) { create(:user) }

  let(:users_result) do
    scoring = {}
    scoring[factor.id.to_s] = { 'norm_score' => 1, 'score' => 2, 'zscore' => 3.3, 'percentage' => 4 }

    create(
      :users_result,
      subject: user,
      evaluator: user,
      campaign: campaign,
      assessment: assessment,
      scoring: scoring,
      status: :completed,
      score_calculated: true
    )
  end

  let!(:user_assessment) do
    create(:user_assessment, subject: user, campaign: campaign, users_result: users_result, status: :completed,
            score_calculated: true, score_calculated_at: Time.zone.now)
  end

  let(:job_record) do
    create(
      :admin_job_record, operation: :assessment_raw_factor_export,
      data: { campaign_id: campaign.id, assessment_id: assessment.id }
    )
  end
  let!(:user_assessment) do
    create(:user_assessment, subject: user, campaign: campaign, users_result: users_result, status: :completed)
  end

  context 'Assessment raw factor export' do
    it 'first row in csv contains result_details_header along with factor names' do
      described_class.call!(job_record)

      csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
      actual_first_row = csv[0]

      expected_first_row = [
        'Result ID',
        'Subject Name',
        'Subject Email',
        'Evaluator Name',
        'Evaluator Email',
        'Relationship',
        'Started At',
        'Completed At',
        'Score Calculated At',
        'Status',
        'factor 1'
      ]

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in csv  contains actual data' do
      described_class.call!(job_record)

      csv = Roo::CSV.new(active_storage_file_path(job_record.file))
      actual_second_row = csv.row(2)

      expected_second_row = [
        users_result.encoded_id,
        "#{users_result.subject.first_name}, #{users_result.subject.last_name}",
        users_result.subject.email,
        "#{users_result.evaluator.first_name}, #{users_result.evaluator.last_name}",
        users_result.evaluator.email,
        users_result.user_assessment.relationship&.name,
        users_result.created_at.to_s,
        users_result.completed_at.to_s,
        user_assessment.score_calculated_at.to_s,
        'Completed',
        '2'
      ]

      expect(actual_second_row).to eq(expected_second_row.flatten)
    end
  end
end
