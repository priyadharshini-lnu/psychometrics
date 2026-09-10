# frozen_string_literal: true

require 'rails_helper'

describe Faas::NotificationHandlers::ZipS3Files do
  include Rails.application.routes.url_helpers

  let(:bulk_report) { create(:bulk_report, :with_attached_file) }
  let(:admin_job_record) { create(:admin_job_record) }

  context 'status is completed' do
    it 'archives file' do
      described_class.call!({
        'bulk_report_id' => bulk_report.id,
        'file_name' => 'abc.pdf',
        'file_path' => 'spec/fixtures/files/reports/test.pdf',
        'status' => 'completed',
        'checksum' => '0',
        'file_size' => 0
      })

      expect(bulk_report.reload.files.first.filename).to eq('archive.zip')
    end

    it 'sends bulk report email' do
      expect(BulkReportMailer).to receive_message_chain(:notify, :deliver_later)

      described_class.call!({
        'bulk_report_id' => bulk_report.id,
        'file_name' => 'abc.pdf',
        'file_path' => 'spec/fixtures/files/reports/test.pdf',
        'status' => 'completed',
        'checksum' => '0',
        'file_size' => 0
      })
    end

    it 'marks admin_job completed' do
      url = 'https://presigned_url.cc'
      allow_any_instance_of(ActiveStorage::Blob).to receive(:url).and_return(url)

      described_class.call!({
        'bulk_report_id' => bulk_report.id,
        'file_name' => 'abc.pdf',
        'file_path' => 'spec/fixtures/files/reports/test.pdf',
        'admin_job_record_id' => admin_job_record.id,
        'status' => 'completed',
        'checksum' => '0',
        'file_size' => 0
      })
      admin_job_record.reload

      expect(admin_job_record.completed?).to eq(true)
      download_url = bulk_report.reload.public_download_urls.first
      expect(admin_job_record.content).to eq("<a href=\"#{download_url}\">abc.pdf</a>")
    end

    it 'links project bulk report jobs to the job detail page after all ZIP batches complete' do
      project = create(:project)
      bulk_report_job = create(:bulk_report_job,
                               project: project,
                               bulk_report: bulk_report,
                               created_by: create(:superadmin),
                               admin_job_record: admin_job_record)
      admin_job_record.update!(
        data: { 'project_id' => project.id, 'bulk_report_job_id' => bulk_report_job.id },
        operation: :project_bulk_download_reports,
        total_tasks: 2,
        completed_tasks: 0
      )

      mailer = double('BulkReportMailer')
      expect(BulkReportMailer).to receive(:notify).once.with(bulk_report).and_return(mailer)
      expect(mailer).to receive(:deliver_later).once

      described_class.call!({
        'bulk_report_id' => bulk_report.id,
        'admin_job_record_id' => admin_job_record.id,
        'status' => 'in_progress',
        'completed_tasks' => 100
      })

      expect(admin_job_record.reload.completed_tasks).to eq(0)

      described_class.call!({
        'bulk_report_id' => bulk_report.id,
        'file_name' => 'project-bulk-report-part-1',
        'admin_job_record_id' => admin_job_record.id,
        'status' => 'completed',
        'checksum' => '0',
        'file_size' => 0
      })

      admin_job_record.reload
      expect(admin_job_record.completed_tasks).to eq(1)
      expect(admin_job_record.completed?).to eq(false)

      described_class.call!({
        'bulk_report_id' => bulk_report.id,
        'file_name' => 'project-bulk-report-part-2',
        'admin_job_record_id' => admin_job_record.id,
        'status' => 'completed',
        'checksum' => '0',
        'file_size' => 0
      })

      admin_job_record.reload
      expected_url = bulk_report_job.project_bulk_report_job_url
      expect(admin_job_record.completed?).to eq(true)
      expect(admin_job_record.content).to eq(
        "<a href=\"#{expected_url}\">#{I18n.t('admin.bulk_reports_view_downloads')}</a>"
      )
    end

    it 'does not send the mailer and marks the project bulk report job failed when a batch fails' do
      admin_job_record.update!(
        operation: :project_bulk_download_reports,
        total_tasks: 2,
        completed_tasks: 0
      )

      expect(BulkReportMailer).not_to receive(:notify)

      described_class.call!({
        'bulk_report_id' => bulk_report.id,
        'file_name' => 'project-bulk-report',
        'admin_job_record_id' => admin_job_record.id,
        'status' => 'failed',
        'error' => 'Lambda batch error'
      })

      expect(admin_job_record.reload).to be_failed
    end
  end

  context 'status is not completed' do
    it "doesn't mark admin_job as completed and doesn't send out BulkDownload email" do
      expect(BulkReportMailer).to_not receive(:notify)

      described_class.call!({
        'bulk_report_id' => bulk_report.id, 'file_name' => 'abc.pdf', 'admin_job_record_id' => admin_job_record.id
      })
      admin_job_record.reload

      expect(admin_job_record.completed?).to eq(false)
    end
  end

  it 'marks admin_job as failed if status received is failed' do
    error = 'Some error from lambda'
    described_class.call!({
      'bulk_report_id' => bulk_report.id, 'file_name' => 'abc.pdf', 'admin_job_record_id' => admin_job_record.id,
      'status' => 'failed', 'error' => error
    })
    admin_job_record.reload

    expect(admin_job_record.failed?).to eq(true)
    expect(admin_job_record.error_messages).to eq([error])
  end

  it 'works when bulk_report_id is wrong or not provided' do
    expect { described_class.call!({}) }.to_not raise_exception
    expect { described_class.call!({ 'bulk_report_id' => 100 }) }.to_not raise_exception
  end
end
