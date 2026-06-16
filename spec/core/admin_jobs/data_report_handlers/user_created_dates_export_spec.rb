# frozen_string_literal: true

require 'csv'
require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::UserCreatedDatesExport do
  let!(:project) { create(:project) }
  let!(:user1) { create(:user, :with_project_membership, project: project) }
  let!(:user2) { create(:user, :with_project_membership, project: project) }

  let(:data_report) do
    create(:data_report,
           owner: project.client,
           report_type: :user_created_dates,
           configuration: { project_ids: [project.id] }.to_json)
  end
  let(:data_report_job) { create(:data_report_job, data_report: data_report) }
  let(:file_path) { Rails.root.join('tmp/test_user_created_dates.csv') }

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

    it 'includes user email and created_at timestamp in the CSV' do
      subject.generate_file

      csv = CSV.read(file_path)
      expect(csv.size).to be > 1
      # Rails.logger.info("CSV content: #{csv.inspect}")
      # puts "CSV content: #{csv.inspect}"
      emails = csv[1..].pluck(0)
      expect(emails).to include(user1.email, user2.email)
    end

    it 'formats timestamps correctly' do
      subject.generate_file

      csv = CSV.read(file_path)
      timestamp_regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{2}:?\d{2}$/

      csv[1..].each do |row|
        expect(row[1]).to match(timestamp_regex)
      end
    end

    it 'sorts results by email' do
      subject.generate_file

      csv = CSV.read(file_path)
      emails = csv[1..].pluck(0)

      expect(emails).to eq(emails.sort)
    end

    context 'when project_ids is blank' do
      let(:data_report) do
        create(:data_report,
               owner: project.client,
               report_type: :user_created_dates,
               configuration: { project_ids: [] }.to_json)
      end

      it 'creates CSV with only headers' do
        subject.generate_file

        csv = CSV.read(file_path)
        expect(csv.size).to eq(1)
        expect(csv[0]).to eq(described_class::HEADERS)
      end
    end

    context 'with multiple projects' do
      let!(:project2) { create(:project, client: project.client) }
      let!(:user3) { create(:user, :with_project_membership, project: project2) }
      let(:data_report) do
        create(:data_report,
               owner: project.client,
               report_type: :user_created_dates,
               configuration: { project_ids: [project.id, project2.id] }.to_json)
      end

      it 'includes users from all specified projects' do
        subject.generate_file

        csv = CSV.read(file_path)
        emails = csv[1..].pluck(0)

        expect(emails).to include(user1.email, user2.email, user3.email)
      end
    end
  end
end
