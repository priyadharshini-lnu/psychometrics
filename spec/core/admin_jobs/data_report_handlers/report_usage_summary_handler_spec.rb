# frozen_string_literal: true

require 'csv'
require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::ReportUsageSummaryHandler do
  let!(:project) { create(:project) }
  let!(:user1) { create(:user, :with_project_membership, project: project) }
  let!(:user2) { create(:user, :with_project_membership, project: project) }
  let(:dimension) { create(:dimension, :with_multiple_occupations) }
  let(:assessment) { create(:assessment, :with_report, name: 'Super Assessment', dimension: dimension) }
  let!(:report) { assessment.reports.first }
  let(:campaign) { create(:campaign, project: project) }
  let!(:user_report) { create(:user_report, report: report, user: user1, campaign: campaign) }
  let(:data_report) do
    create(:data_report,
           owner: project.client,
           report_type: :report_usage_summary,
           configuration: { project_ids: [project.id], report_ids: [report.id] }.to_json)
  end
  let(:data_report_job) { create(:data_report_job, data_report: data_report) }
  let(:file_path) { Rails.root.join('tmp/test_report_usage_summary.csv') }
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

    it 'includes data rows in the CSV file with the correct count' do
      create(:user_report, report: report, user: user2, campaign: campaign)

      subject.generate_file

      csv = CSV.read(file_path)

      expect(csv.length).to eq(2)
      expect(csv[1][0]).to eq(report.id.to_s)
      expect(csv[1][1]).to eq(report.name)
      expect(csv[1][2]).to eq(project.id.to_s)
      expect(csv[1][3]).to eq(project.name)
      expect(csv[1][4]).to eq(campaign.id.to_s)
      expect(csv[1][5]).to eq(campaign.name)
      expect(csv[1][6]).to eq('2')
    end

    it 'handles no data gracefully' do
      UserReport.delete_all

      subject.generate_file

      csv = CSV.read(file_path)
      expect(csv.length).to eq(1)
      expect(csv[0]).to eq(described_class::HEADERS)
    end
  end
end
