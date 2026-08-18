# frozen_string_literal: true

require 'csv'
require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::CampaignUserCreationHandler do
  let!(:tenancy) { create(:tenancy) }
  let!(:project) { create(:project, parent: tenancy) }
  let!(:campaign) { create(:campaign, project: project) }
  let!(:user) { create(:user, :with_project_membership, project: project) }

  let!(:campaign_user) do
    create(
      :campaign_user,
      campaign: campaign,
      user: user,
      completion_status: 2,
      created_at: '2024-01-15 10:30:00'
    )
  end

  let(:data_report) do
    create(
      :data_report,
      owner: tenancy,
      report_type: :campaign_user_creation,
      configuration: {
        project_ids: [project.id]
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
    Rails.root.join('tmp/test_campaign_user_creation.csv')
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

  describe '.runtime_parameters' do
    it 'exposes start_date as a runtime-updatable date parameter' do
      param = described_class.runtime_parameters.find { |p| p[:name] == 'start_date' }

      expect(param).to be_present
      expect(param[:type]).to eq('date')
      expect(param[:runtime_updatable]).to be(true)
    end

    it 'exposes end_date as a runtime-updatable date parameter' do
      param = described_class.runtime_parameters.find { |p| p[:name] == 'end_date' }

      expect(param).to be_present
      expect(param[:type]).to eq('date')
      expect(param[:runtime_updatable]).to be(true)
    end

    it 'has exactly two runtime parameters' do
      expect(described_class.runtime_parameters.size).to eq(2)
    end
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

      expect(File.exist?(file_path)).to be(true)

      csv = CSV.read(file_path)

      expect(csv.first).to eq(described_class::HEADERS)
    end

    it 'includes campaign user creation data in the CSV' do
      subject.generate_file

      csv = CSV.read(file_path)

      expect(csv.size).to be > 1

      row = csv[1]

      expect(row[0]).to eq(project.name)
      expect(row[1]).to eq(campaign.name)
      expect(row[2]).to eq(user.email)
      expect(row[3]).to eq(user.first_name)
      expect(row[4]).to eq(user.last_name)
      expect(row[5]).not_to be_blank
      expect(row[6]).to eq('Completed')
    end

    it 'formats completion status correctly' do
      campaign_user.update!(completion_status: 0)

      subject.generate_file

      csv = CSV.read(file_path)
      row = csv[1]

      expect(row[6]).to eq('Not Started')
    end

    it 'handles in_progress completion status' do
      campaign_user.update!(completion_status: 1)

      subject.generate_file

      csv = CSV.read(file_path)
      row = csv[1]

      expect(row[6]).to eq('In Progress')
    end

    it 'orders records by project name, campaign name, and email' do
      project2 = create(:project, parent: tenancy, name: 'A Project')
      campaign2 = create(:campaign, project: project2, name: 'B Campaign')
      user2 = create(:user, :with_project_membership, project: project2, email: 'zzz@example.com')

      create(:campaign_user, campaign: campaign2, user: user2)

      data_report.update!(configuration: { project_ids: [project.id, project2.id] }.to_json)

      subject.generate_file

      csv = CSV.read(file_path)

      expect(csv.size).to eq(3) # header + 2 rows
      expect(csv[1][0]).to eq('A Project') # ordered by project name
      expect(csv[2][0]).to eq(project.name)
    end

    context 'with date range filtering' do
      let(:data_report) do
        create(
          :data_report,
          owner: tenancy,
          report_type: :campaign_user_creation,
          configuration: {
            project_ids: [project.id],
            start_date: '2024-01-01',
            end_date: '2024-01-31'
          }.to_json
        )
      end

      it 'includes only campaign users created within the date range' do
        outside_user = create(:user, :with_project_membership, project: project)
        create(
          :campaign_user,
          campaign: campaign,
          user: outside_user,
          created_at: '2023-12-31 10:00:00'
        )

        subject.generate_file

        csv = CSV.read(file_path)

        expect(csv.size).to eq(2) # header + 1 row (only the one from Jan)
        expect(csv[1][2]).to eq(user.email)
      end
    end

    context 'with multiple projects' do
      let!(:project2) { create(:project, parent: tenancy) }
      let!(:campaign2) { create(:campaign, project: project2) }
      let!(:user2) { create(:user, :with_project_membership, project: project2) }

      let!(:campaign_user2) do
        create(
          :campaign_user,
          campaign: campaign2,
          user: user2,
          completion_status: 1
        )
      end

      let(:data_report) do
        create(
          :data_report,
          owner: tenancy,
          report_type: :campaign_user_creation,
          configuration: {
            project_ids: [project.id, project2.id]
          }.to_json
        )
      end

      it 'includes data from all projects' do
        subject.generate_file

        csv = CSV.read(file_path)

        expect(csv.size).to eq(3) # header + 2 rows

        project_names = csv.drop(1).pluck(0)

        expect(project_names).to include(project.name, project2.name)
      end
    end

    context 'when no project_ids are provided' do
      let(:data_report) do
        create(
          :data_report,
          owner: tenancy,
          report_type: :campaign_user_creation,
          configuration: {
            project_ids: []
          }.to_json
        )
      end

      it 'returns empty data rows' do
        subject.generate_file

        csv = CSV.read(file_path)

        expect(csv.size).to eq(1)
        expect(csv.first).to eq(described_class::HEADERS)
      end
    end

    context 'when no campaign users exist' do
      before do
        CampaignUser.delete_all
      end

      it 'only writes the header row' do
        subject.generate_file

        csv = CSV.read(file_path)

        expect(csv.size).to eq(1)
        expect(csv.first).to eq(described_class::HEADERS)
      end
    end

    it 'formats timestamps correctly' do
      campaign_user.update!(created_at: Time.zone.local(2024, 6, 15, 14, 30, 45))

      subject.generate_file

      csv = CSV.read(file_path)
      row = csv[1]

      expect(row[5]).to include('2024-06-15')
      expect(row[5]).to match(/\d{2}:\d{2}:\d{2}/) # Any timestamp in HH:MM:SS format
    end
  end

  describe 'HEADERS constant' do
    it 'includes required columns' do
      expected_headers = [
        'Project Name',
        'Campaign Name',
        'Email',
        'First Name',
        'Last Name',
        'Created At',
        'Completion Status'
      ]

      expect(described_class::HEADERS).to eq(expected_headers)
    end
  end
end
