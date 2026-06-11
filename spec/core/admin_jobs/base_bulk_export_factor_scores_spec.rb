# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::BaseBulkExportFactorScores do
  let(:campaign) { create(:campaign) }
  let(:dimension) { create(:dimension, name: 'DNT: QA/first*live? [demo]') }
  let!(:assessment) { create(:assessment, :agile, dimension: dimension) }
  let(:job_record) do
    create(
      :admin_job_record,
      operation: :bulk_export_raw_factor_scores,
      data: {
        campaign_id: campaign.id,
        assessment_ids: [assessment.id],
        start_date: 2.days.ago.iso8601,
        end_date: Time.zone.now.iso8601
      }
    )
  end

  let(:job_class) do
    Class.new(described_class) do
      private

      def score_field
        'score'
      end
    end
  end

  let(:job) { job_class.new(job_record) }

  before do
    create(:campaign_assessment, campaign: campaign, assessment: assessment)
  end

  describe '#call' do
    it 'completes with no_data_found error when no records exist in date range' do
      job_class.call!(job_record)

      expect(job_record.reload.error_messages).to include(I18n.t('admin.bulk_assessment_download_no_data_found'))
    end
  end

  describe '#xlsx' do
    it 'generates worksheet names with Dimension prefix and sanitized value' do
      package = job.send(:xlsx)
      sheet_names = package.workbook.worksheets.map(&:name)

      expect(sheet_names.first).to start_with('Dimension -')
      expect(sheet_names.first).not_to include(':')
    end
  end

  describe '#include_inactive_users' do
    it 'defaults to false when param is missing' do
      expect(job.send(:include_inactive_users)).to be false
    end
  end
end
