# frozen_string_literal: true

require 'csv'
require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::CampaignFactorScoresHandler do
  let!(:tenancy) { create(:tenancy) }
  let!(:project) { create(:project, parent: tenancy) }

  let!(:campaign) { create(:campaign, project: project) }
  let!(:user) { create(:user, :with_project_membership, project: project) }

  let!(:factor_group) do
    create(
      :campaign_factor_group,
      campaign: campaign,
      name: 'Leadership'
    )
  end

  let!(:factor) do
    create(
      :campaign_factor,
      campaign: campaign,
      campaign_factor_group: factor_group,
      name: 'Decision Making',
      code: 'DM'
    )
  end

  let!(:campaign_user) do
    create(
      :campaign_user,
      campaign: campaign,
      user: user,
      campaign_scores_finalized: true,
      campaign_scores_finalized_date: Time.current
    )
  end

  let!(:factor_value) do
    create(
      :campaign_factor_value,
      campaign: campaign,
      campaign_factor: factor,
      user: user,
      numeric_value: 8.5,
      string_value: 'High'
    )
  end

  let(:data_report) do
    create(
      :data_report,
      owner: tenancy,
      report_type: :campaign_factor_scores,
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
    Rails.root.join('tmp/test_campaign_factor_scores.csv')
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

      expect(File.exist?(file_path)).to be(true)

      csv = CSV.read(file_path)

      expect(csv.first).to eq(described_class::HEADERS)
    end

    it 'includes campaign factor score data in the CSV' do
      subject.generate_file

      csv = CSV.read(file_path)

      expect(csv.size).to be > 1

      row = csv[1]

      expect(row[0].to_i).to eq(tenancy.id)
      expect(row[1]).to eq(tenancy.name)
      expect(row[2].to_i).to eq(project.id)
      expect(row[3]).to eq(project.name)
      expect(row[4].to_i).to eq(campaign.id)
      expect(row[5]).to eq(campaign.name)
      expect(row[6].to_i).to eq(user.id)
      expect(row[7]).to eq(user.email)
      expect(row[8]).to eq(factor_group.name)
      expect(row[9]).to eq(factor.name)
      expect(row[10]).to eq(factor.code)
      expect(row[11]).to eq('8.5')
      expect(row[12]).to eq('High')
      expect(row[13]).not_to be_blank
    end

    context 'with multiple projects' do
      let!(:project2) { create(:project, parent: tenancy) }
      let!(:campaign2) { create(:campaign, project: project2) }
      let!(:user2) { create(:user, :with_project_membership, project: project2) }

      let!(:factor_group2) do
        create(
          :campaign_factor_group,
          campaign: campaign2
        )
      end

      let!(:factor2) do
        create(
          :campaign_factor,
          campaign: campaign2,
          campaign_factor_group: factor_group2
        )
      end

      let!(:campaign_user2) do
        create(
          :campaign_user,
          campaign: campaign2,
          user: user2,
          campaign_scores_finalized: true,
          campaign_scores_finalized_date: Time.current
        )
      end

      let!(:factor_value2) do
        create(
          :campaign_factor_value,
          campaign: campaign2,
          campaign_factor: factor2,
          user: user2,
          numeric_value: 5.0
        )
      end

      let(:data_report) do
        create(
          :data_report,
          owner: tenancy,
          report_type: :campaign_factor_scores,
          configuration: {
            project_ids: [project.id, project2.id]
          }.to_json
        )
      end

      it 'includes data from all projects' do
        subject.generate_file

        csv = CSV.read(file_path)

        project_ids = csv.drop(1).map { |r| r[2].to_i }

        expect(project_ids).to include(project.id, project2.id)
      end
    end

    context 'when no records match' do
      before do
        campaign_user.update!(campaign_scores_finalized: false)
      end

      it 'only writes the header row' do
        subject.generate_file

        csv = CSV.read(file_path)

        expect(csv.size).to eq(1)
        expect(csv.first).to eq(described_class::HEADERS)
      end
    end
  end
end
