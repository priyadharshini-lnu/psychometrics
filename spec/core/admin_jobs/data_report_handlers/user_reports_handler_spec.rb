# frozen_string_literal: true

require 'csv'
require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::UserReportsHandler do
  let!(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user, :with_project_membership, project: project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:report) { create(:report) }
  let!(:user_report) { create(:user_report, user: user, report: report, campaign: campaign) }

  let(:data_report) do
    create(:data_report,
           owner: project.client,
           report_type: :user_reports_export,
           configuration: { project_ids: [project.id] }.to_json)
  end
  let(:data_report_job) { create(:data_report_job, data_report: data_report) }
  let(:file_path) { Rails.root.join('tmp/test_user_reports.csv') }

  subject do
    described_class.new(
      data_report: data_report,
      data_report_job: data_report_job,
      file_path: file_path
    )
  end

  after do
    FileUtils.rm_f(file_path)
  end

  describe '.file_extension' do
    it 'returns csv' do
      expect(described_class.file_extension).to eq('csv')
    end
  end

  describe '#file_extension' do
    it 'delegates to class method' do
      expect(subject.file_extension).to eq('csv')
    end
  end

  describe '#generate_file' do
    it 'creates a CSV file with headers' do
      subject.generate_file

      expect(File.exist?(file_path)).to be true
      csv = CSV.read(file_path)
      expect(csv[0]).to eq(described_class::HEADERS)
    end

    it 'includes user report data in the CSV' do
      subject.generate_file

      csv = CSV.read(file_path)
      expect(csv.size).to be > 1

      data_row = csv[1]
      expect(data_row[0].to_i).to eq(project.id)
      expect(data_row[1]).to eq(project.name)
      expect(data_row[2].to_i).to eq(campaign.id)
      expect(data_row[3]).to eq(campaign.name)
      expect(data_row[4]).to eq("#{user.first_name} #{user.last_name}")
      expect(data_row[5]).to eq(user.email)
      expect(data_row[6].to_i).to eq(report.id)
      expect(data_row[7]).to eq(report.name)
    end

    context 'when project_ids is blank' do
      let(:data_report) do
        create(:data_report,
               owner: project.client,
               report_type: :user_reports_export,
               configuration: { project_ids: [] }.to_json)
      end

      it 'creates CSV with only headers' do
        subject.generate_file

        csv = CSV.read(file_path)
        expect(csv.size).to eq(1)
        expect(csv[0]).to eq(described_class::HEADERS)
      end
    end

    context 'with multiple projects and campaigns' do
      let(:project2) { create(:project, client: project.client) }
      let(:campaign2) { create(:campaign, project: project2) }
      let(:user2) { create(:user, :with_project_membership, project: project2) }
      let!(:campaign_user2) { create(:campaign_user, campaign: campaign2, user: user2) }
      let!(:user_report2) { create(:user_report, user: user2, report: report, campaign: campaign2) }

      let(:data_report) do
        create(:data_report,
               owner: project.client,
               report_type: :user_reports_export,
               configuration: { project_ids: [project.id, project2.id] }.to_json)
      end

      it 'includes data from all projects' do
        subject.generate_file

        csv = CSV.read(file_path)
        project_ids = csv[1..].map { |row| row[0].to_i }

        expect(project_ids).to include(project.id, project2.id)
      end
    end
  end
end
