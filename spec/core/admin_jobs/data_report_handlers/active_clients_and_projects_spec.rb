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
        start_date: 1.day.ago.iso8601,
        end_date: 1.day.from_now.iso8601
      }.to_json
    )
  end
  let(:data_report_job) { create(:data_report_job, data_report: data_report) }
  let(:file_path) { Rails.root.join('tmp/test_active_clients_projects.csv') }

  subject do
    described_class.new(
      data_report: data_report,
      data_report_job: data_report_job,
      file_path: file_path,
      user_country: user_country
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
    let(:user_country) { nil }
    it 'delegates to class method' do
      expect(subject.file_extension).to eq('csv')
    end
  end

  describe '#generate_file' do
    let(:user_country) { nil }
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

  describe '#generate_file_geo_restriction' do
    let(:top_level_client) { campaign.project.client }
    let(:allowed_country) { 'India' }
    let(:blocked_country) { 'Saudi Arabia' }

    before do
      top_level_client.update!(restricted_to_countries: [allowed_country])
      allow(Settings.features).to receive(:disable_geo_restriction).and_return(false)
    end

    context 'when the requesting country is blocked for the client' do
      let(:user_country) { blocked_country }

      it 'does not raise (regression test for the trailing-dot syntax bug)' do
        expect { subject.generate_file }.not_to raise_error
      end

      it 'excludes the client from the generated CSV' do
        subject.generate_file
        csv = CSV.read(file_path)

        expect(csv.drop(1).map(&:first)).not_to include(top_level_client.id.to_s)
      end
    end

    context 'when the requesting country is in the allow-list' do
      let(:user_country) { allowed_country }

      it 'includes the client in the generated CSV' do
        subject.generate_file
        csv = CSV.read(file_path)

        expect(csv.drop(1).map(&:first)).to include(top_level_client.id.to_s)
      end
    end

    context 'when user_country is blank' do
      let(:user_country) { nil }

      it 'includes the client (no filtering without a known country)' do
        subject.generate_file
        csv = CSV.read(file_path)

        expect(csv.drop(1).map(&:first)).to include(top_level_client.id.to_s)
      end
    end

    context 'when disable_geo_restriction is true' do
      let(:user_country) { blocked_country }

      it 'includes the client regardless of restriction' do
        allow(Settings.features).to receive(:disable_geo_restriction).and_return(true)
        subject.generate_file
        csv = CSV.read(file_path)

        expect(csv.drop(1).map(&:first)).to include(top_level_client.id.to_s)
      end
    end
  end
end
