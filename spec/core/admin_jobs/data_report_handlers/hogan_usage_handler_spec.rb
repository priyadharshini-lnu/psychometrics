# frozen_string_literal: true

require 'csv'
require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::HoganUsageHandler do
  let!(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user, :with_project_membership, project: project) }

  let(:assessment) { create(:assessment_hogan) }
  let(:report) { create(:report, :hogan, assessments: [assessment]) }

  let!(:user_assessment) do
    create(
      :user_assessment,
      assessment: assessment,
      campaign: campaign,
      subject: user,
      status: :completed,
      completed_at: Time.current
    )
  end

  let!(:user_report) do
    create(
      :user_report,
      user: user,
      report: report,
      campaign: campaign
    )
  end

  let(:data_report) do
    create(
      :data_report,
      owner: project.client,
      report_type: :hogan_usage_report,
      configuration: { project_ids: [project.id] }.to_json
    )
  end

  let(:data_report_job) do
    create(
      :data_report_job,
      data_report: data_report
    )
  end

  let(:file_path) do
    Rails.root.join('tmp/test_hogan_usage_report.csv')
  end

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

    it 'includes hogan usage data in the CSV' do
      subject.generate_file

      csv = CSV.read(file_path)

      expect(csv.size).to be > 1

      data_row = csv[1]

      expect(data_row[0].to_i).to eq(report.id)
      expect(data_row[1]).to eq(report.name)
      expect(data_row[2].to_i).to eq(project.id)
      expect(data_row[3]).to eq(project.name)
      expect(data_row[4].to_i).to eq(campaign.id)
      expect(data_row[5]).to eq(campaign.name)
      expect(data_row[6]).to eq("#{user.first_name} #{user.last_name}")
      expect(data_row[7]).to eq(user.email)
    end

    context 'with multiple projects' do
      let(:project2) { create(:project, client: project.client) }
      let(:campaign2) { create(:campaign, project: project2) }
      let(:user2) { create(:user, :with_project_membership, project: project2) }

      let!(:user_assessment2) do
        create(
          :user_assessment,
          assessment: assessment,
          campaign: campaign2,
          subject: user2,
          status: :completed,
          completed_at: Time.current
        )
      end

      let!(:user_report2) do
        create(
          :user_report,
          user: user2,
          report: report,
          campaign: campaign2
        )
      end

      let(:data_report) do
        create(
          :data_report,
          owner: project.client,
          report_type: :hogan_usage_report,
          configuration: {
            project_ids: [project.id, project2.id]
          }.to_json
        )
      end

      it 'includes data from all projects' do
        subject.generate_file

        csv = CSV.read(file_path)

        project_ids = csv[1..].map { |row| row[2].to_i }

        expect(project_ids).to include(project.id, project2.id)
      end
    end
  end
end
