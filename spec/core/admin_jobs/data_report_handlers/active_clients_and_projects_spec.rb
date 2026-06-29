# frozen_string_literal: true

require 'csv'
require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::ActiveClientsProjectsHandler do
  let!(:assessment) { create(:assessment) }
  let!(:campaign) { create(:campaign) }
  let!(:project) { create(:project) }
  let(:user1) { create(:user, :with_project_membership, project: project) }
  let(:user) { create(:user, :with_project_membership, project: project) }
  let!(:client) { create(:tenancy) }
  let!(:user_assessment) do
    campaign_user = create(:campaign_user, campaign: campaign, user: user)
    campaign_user.campaign.reports = assessment.reports
    campaign_user.campaign.assessments = [assessment]
    user_result = create(:users_result, subject: user, evaluator: user, assessment: assessment)
    create(:user_assessment,
           subject: user1,
           evaluator: user1,
           assessment: assessment,
           campaign: campaign,
           users_result: user_result,
           last_activity_at: 1.day.ago)
  end
  let(:data_report) do
    create(
      :data_report,
      owner: nil,
      scope: 'global',
      report_type: :active_clients_projects,
      configuration: {
        activity_period: [
          1.day.ago.iso8601,
          1.day.from_now.iso8601
        ]
      }.to_json
    )
  end
  let(:data_report_job) { create(:data_report_job, data_report: data_report) }
  let(:file_path) { Rails.root.join('tmp/test_active_clients_projects.csv') }

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
    end
  end
end
