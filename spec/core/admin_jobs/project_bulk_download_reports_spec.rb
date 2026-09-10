# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::ProjectBulkDownloadReports do
  let(:project)     { create(:project) }
  let(:superadmin)  { create(:superadmin) }
  let(:campaign)    { create(:campaign, project: project) }
  let(:report)      { create(:report) }

  let(:job_record) do
    create(:admin_job_record,
           operation: :project_bulk_download_reports,
           owner: superadmin,
           data: {
             'project_id' => project.id,
             'campaign_ids' => [campaign.id],
             'selected_reports' => { report.id.to_s => ['en'] },
             'start_date' => 2.weeks.ago.iso8601,
             'end_date' => Time.zone.now.iso8601
           })
  end

  let(:admin_job) { described_class.new(job_record) }

  describe '#valid?' do
    it 'returns true when campaign_ids and selected_reports are present' do
      expect(admin_job.valid?).to be true
    end

    it 'returns false when campaign_ids is blank' do
      job_record.data['campaign_ids'] = []
      expect(admin_job.valid?).to be false
    end

    it 'returns false when selected_reports is blank' do
      job_record.data['selected_reports'] = {}
      expect(admin_job.valid?).to be false
    end
  end

  describe '#generate_title_link' do
    it 'links to the project bulk reports index' do
      link = admin_job.generate_title_link
      expect(link[:href]).to eq("/admin/projects/#{project.id}/bulk_reports")
    end

    it 'includes the project name in the label' do
      link = admin_job.generate_title_link
      expect(link[:label]).to include(project.name)
    end
  end

  describe '#generate_details' do
    it 'includes project_id, campaign ids, and report ids' do
      details = admin_job.generate_details

      labels = details.map(&:first)
      expect(labels).to include('Project ID', 'Campaigns', 'Reports')
    end

    it 'lists the correct campaign ids' do
      details = admin_job.generate_details.to_h
      expect(details['Campaigns']).to include(campaign.id.to_s)
    end

    it 'lists the correct report ids' do
      details = admin_job.generate_details.to_h
      expect(details['Reports']).to include(report.id.to_s)
    end
  end

  describe '.call' do
    context 'when BulkDownload returns an error' do
      before do
        allow(Projects::BulkDownload).to receive(:call).and_return(
          { ok: { error_messages: ['No reports available'] } }
        )
      end

      it 'broadcasts :ok with the error messages' do
        result = described_class.call(job_record)
        expect(result[:ok]).to include(error_messages: ['No reports available'])
      end
    end

    context 'when BulkDownload returns a BulkReport (non-FaaS path)' do
      let(:bulk_report) { create(:bulk_report, user: superadmin) }
      let(:bulk_report_job) do
        create(:bulk_report_job,
               project: project,
               bulk_report: bulk_report,
               created_by: superadmin,
               admin_job_record: job_record)
      end

      before do
        job_record.data['bulk_report_job_id'] = bulk_report_job.id
        job_record.save!
        allow(Projects::BulkDownload).to receive(:call).and_return({ ok: bulk_report })
      end

      it 'broadcasts :ok with content containing the job detail link' do
        result = described_class.call(job_record)
        expect(result[:ok][:content]).to include(
          "/admin/projects/#{project.id}/bulk_reports/#{bulk_report_job.id}"
        )
      end
    end

    context 'when BulkDownload broadcasts :waiting (FaaS path)' do
      before do
        allow(Projects::BulkDownload).to receive(:call).and_return({ waiting: true })
      end

      it 'does not raise and returns nil content (FaaS completes via webhook)' do
        expect { described_class.call(job_record) }.not_to raise_error
      end
    end
  end
end
