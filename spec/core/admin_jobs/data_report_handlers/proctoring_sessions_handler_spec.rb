# frozen_string_literal: true

require 'csv'
require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::ProctoringSessionsHandler do
  let!(:project) { create(:project) }
  let!(:campaign) { create(:campaign, project: project) }
  let!(:user) { create(:user, :with_project_membership, project: project) }

  let!(:campaign_user) do
    create(
      :campaign_user,
      campaign: campaign,
      user: user
    )
  end

  let!(:proctoring_session) do
    create(
      :proctoring_session,
      campaign_user: campaign_user,
      created_at: Time.zone.parse('2025-01-15 10:30:00')
    )
  end

  let(:data_report) do
    create(
      :data_report,
      owner: project.client,
      report_type: :proctoring_sessions,
      configuration: {
        project_ids: [project.id],
        start_date: '2025-01-01',
        end_date: '2025-03-01'
      }.to_json
    )
  end

  let(:data_report_job) do
    create(
      :data_report_job,
      data_report: data_report
    )
  end

  let(:file_path) do
    Rails.root.join('tmp/test_proctoring_sessions.csv')
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

  describe '.runtime_parameters' do
    it 'returns start and end date parameters' do
      parameter_names = described_class.runtime_parameters.pluck(:name)

      expect(parameter_names).to contain_exactly('start_date', 'end_date')
    end
  end

  describe '#generate_file' do
    it 'creates a CSV file with headers' do
      subject.generate_file

      expect(File.exist?(file_path)).to be true

      csv = CSV.read(file_path)

      expect(csv[0]).to eq(described_class::HEADERS)
    end

    it 'includes proctoring session data in the CSV' do
      subject.generate_file

      csv = CSV.read(file_path)

      expect(csv.size).to eq(2)

      data_row = csv[1]

      expect(data_row[0]).to eq(proctoring_session.session_id.to_s)
      expect(data_row[1]).to eq(project.client.name)
      expect(data_row[2]).to eq(project.name)
      expect(data_row[3]).to eq(campaign.name)
      expect(data_row[4]).to eq(user.email)
    end

    it 'formats created_at correctly' do
      subject.generate_file

      csv = CSV.read(file_path)

      data_row = csv[1]

      timestamp_regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

      expect(data_row[5]).to match(timestamp_regex)
    end

    context 'when project_ids is blank' do
      let(:data_report) do
        create(
          :data_report,
          owner: project.client,
          report_type: :proctoring_sessions,
          configuration: {
            project_ids: [],
            start_date: '2025-01-01',
            end_date: '2025-03-01'
          }.to_json
        )
      end

      it 'includes all matching records' do
        subject.generate_file

        csv = CSV.read(file_path)

        expect(csv.size).to be > 1
      end
    end

    context 'with project filter' do
      let(:data_report) do
        create(
          :data_report,
          owner: project.client,
          report_type: :proctoring_sessions,
          configuration: {
            project_ids: [project.id],
            start_date: '2025-01-01',
            end_date: '2025-03-01'
          }.to_json
        )
      end

      it 'returns only data for specified project' do
        subject.generate_file

        csv = CSV.read(file_path)

        session_ids = csv[1..].map(&:first)

        expect(session_ids).to all(eq(proctoring_session.session_id.to_s))
      end
    end

    context 'with multiple projects' do
      let!(:project2) { create(:project, client: project.client) }
      let!(:campaign2) { create(:campaign, project: project2) }
      let!(:user2) { create(:user, :with_project_membership, project: project2) }

      let!(:campaign_user2) do
        create(
          :campaign_user,
          campaign: campaign2,
          user: user2
        )
      end

      let!(:proctoring_session2) do
        create(
          :proctoring_session,
          campaign_user: campaign_user2,
          created_at: Time.zone.parse('2025-01-20 10:30:00')
        )
      end

      let(:data_report) do
        create(
          :data_report,
          owner: project.client,
          report_type: :proctoring_sessions,
          configuration: {
            project_ids: [project.id, project2.id],
            start_date: '2025-01-01',
            end_date: '2025-03-01'
          }.to_json
        )
      end

      it 'includes data from all projects' do
        subject.generate_file

        csv = CSV.read(file_path)

        session_ids = csv[1..].map(&:first)

        expect(session_ids).to include(
          proctoring_session.session_id.to_s,
          proctoring_session2.session_id.to_s
        )
      end
    end

    context 'with start date filter' do
      let!(:earlier_session) do
        create(
          :proctoring_session,
          campaign_user: campaign_user,
          created_at: Time.zone.parse('2024-12-31 23:59:59')
        )
      end

      it 'excludes sessions before the start date' do
        subject.generate_file

        csv = CSV.read(file_path)

        session_ids = csv[1..].map(&:first)

        expect(session_ids).to include(proctoring_session.session_id.to_s)
        expect(session_ids).not_to include(earlier_session.session_id.to_s)
      end
    end

    context 'with end date filter' do
      let!(:later_session) do
        create(
          :proctoring_session,
          campaign_user: campaign_user,
          created_at: Time.zone.parse('2025-03-01 00:00:00')
        )
      end

      it 'excludes sessions on or after the end date' do
        subject.generate_file

        csv = CSV.read(file_path)

        session_ids = csv[1..].map(&:first)

        expect(session_ids).to include(proctoring_session.session_id.to_s)
        expect(session_ids).not_to include(later_session.session_id.to_s)
      end
    end

    context 'with multiple sessions' do
      let!(:later_session) do
        create(
          :proctoring_session,
          campaign_user: campaign_user,
          created_at: Time.zone.parse('2025-02-01 10:30:00')
        )
      end

      it 'orders sessions by created_at' do
        subject.generate_file

        csv = CSV.read(file_path)

        session_ids = csv[1..].map(&:first)

        expect(session_ids).to eq(
          [
            proctoring_session.session_id.to_s,
            later_session.session_id.to_s
          ]
        )
      end
    end
  end
end
