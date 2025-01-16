# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportUserReportEvents, type: :job do
  let!(:superadmin) { create(:superadmin) }
  let!(:user_report) { create(:user_report, user: superadmin) }
  let!(:user_report_event) do
    create(
      :user_report_event,
      id: 1,
      event_type: 'status_changed',
      initiator: superadmin,
      user_report: user_report,
      details: { 'to' => 'Change Requested', 'from' => 'Approved' },
      created_at: 2.days.ago
    )
  end
  let(:record) do
    create(:admin_job_record,
           data: { 'campaign_id' => user_report.campaign_id, start_date: 3.months.ago, end_date: Time.zone.now })
  end
  let(:job) { described_class.new(record) }

  describe '#headers' do
    it 'returns the correct headers for the CSV' do
      expect(job.headers).to eq(AdminJobs::ExportUserReportEvents::HEADERS)
    end
  end

  describe '#data_row' do
    context 'with status changed event' do
      it 'returns a formatted row of data for csv' do
        row = job.records_for_export.first
        data_row = job.data_row(row)

        expect(data_row[0]).to eq(user_report_event.id)
        expect(data_row[1]).to eq(user_report.campaign.project_id)
        expect(data_row[2]).to eq(user_report.campaign.project.name)
        expect(data_row[3]).to eq(user_report.campaign_id)
        expect(data_row[4]).to eq(user_report.campaign.name)
        expect(data_row[5]).to eq(superadmin.first_name)
        expect(data_row[6]).to eq(superadmin.last_name)
        expect(data_row[7]).to eq(superadmin.email)
        expect(data_row[8]).to eq(superadmin.first_name)
        expect(data_row[9]).to eq(superadmin.last_name)
        expect(data_row[10]).to eq(superadmin.email)
        expect(data_row[11]).to eq(user_report.report.id)
        expect(data_row[12]).to eq(nil)
        expect(data_row[13]).to eq(nil)
        expect(data_row[14]).to eq(I18n.l(user_report_event.created_at, format: :short))
        expect(data_row[15]).to eq(user_report_event.event_type)
        expect(data_row[16]).to eq(nil)
        expect(data_row[17]).to eq('Approved')
      end
    end

    context 'with content' do
      long_text = 'abc' * 80
      let!(:comment_event) do
        create(
          :user_report_event,
          id: 2,
          event_type: 'comment_added',
          initiator: superadmin,
          user_report: user_report,
          details: { 'text' => "<p>#{long_text}</p>" }
        )
      end

      it 'includes and strips HTML from comment text' do
        row = job.records_for_export.find { |r| r.id == comment_event.id }
        data_row = job.data_row(row)
        expect(data_row[16]).to eq(long_text)
      end
    end
  end

  describe '#file_name' do
    it 'generates a valid filename' do
      file_name = job.file_name
      expect(file_name).to match(/^user-report-events-[a-z_]+-\d+\.csv$/)
    end
  end

  describe '#generate_details' do
    it 'returns an array with translated label and file link' do
      allow(job).to receive(:file_link).and_return('link_to_file')
      expect(job.generate_details).to eq([[I18n.t('administration.navigation.user_report_events'), 'link_to_file']])
    end
  end
end
