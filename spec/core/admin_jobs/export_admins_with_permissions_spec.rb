# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportAdminsWithPermissions, type: :job do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:project2) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }
  let(:campaign2) { create(:campaign, project: project2) }

  let!(:project_admin1) { create(:project_admin, project: project) }
  let!(:project_admin2) { create(:project_admin, project: project) }
  let!(:project2_admin1) { create(:project_admin, project: project2) }
  let!(:project2_admin2) { create(:project_admin, project: project2) }
  let!(:campaign_admin1) { create(:campaign_admin, campaign: campaign) }
  let!(:campaign_admin2) { create(:campaign_admin, campaign: campaign) }
  let!(:campaign2_admin1) { create(:campaign_admin, campaign: campaign2) }
  let!(:campaign2_admin2) { create(:campaign_admin, campaign: campaign2) }
  let!(:client_admin1) { create(:client_admin, client: client) }

  let!(:expected_header_row) do
    expected_first_row = [
      'Membership ID',
      'Email',
      'Role',
      'Client ID',
      'Client Name',
      'Project ID',
      'Project Name',
      'Campaign ID',
      'Campaign Name',
      *AllowedPermissions::CLIENT_ADMIN_PERMISSIONS.flat_map do |key, values|
        values.map { |value| "#{key.titleize} - #{value.titleize}" }
      end
    ]
    expected_first_row
  end

  context 'when campaign_id is provided' do
    let(:job_record) do
      create(:admin_job_record, operation: :export_admin_with_permissions, data: { campaign_id: campaign.id })
    end

    it 'exports correct headers' do
      described_class.call!(job_record)

      csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
      actual_first_row = csv[0]

      expect(actual_first_row).to eq(expected_header_row)
    end

    it 'exports only campaign admins' do
      campaign_admins_emails = Membership.where(
        role: :campaign_admin,
        campaign_id: campaign.id
      ).includes(:user).map { |membership| membership.user.email }

      described_class.call!(job_record)
      csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
      exported_emails = csv.map { |row| row[1] }.drop(1)

      expect(exported_emails).to match_array(campaign_admins_emails)
    end

    it 'exports only campaign admins even if project_id is provided' do
      job_record = create(:admin_job_record, operation: :export_admin_with_permissions,
                    data: { campaign_id: campaign.id, project_id: project.id })

      campaign_admins_emails = Membership.where(
        role: :campaign_admin,
        campaign_id: campaign.id
      ).includes(:user).map { |membership| membership.user.email }

      described_class.call!(job_record)
      csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
      exported_emails = csv.map { |row| row[1] }.drop(1)

      expect(exported_emails).to match_array(campaign_admins_emails)
    end
  end

  context 'when project_id is provided' do
    let(:job_record) do
      create(:admin_job_record, operation: :export_admin_with_permissions, data: { project_id: project.id })
    end

    it 'exports correct headers' do
      described_class.call!(job_record)

      csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
      actual_first_row = csv[0]

      expect(actual_first_row).to eq(expected_header_row)
    end

    it 'exports project admins and its campaign admins' do
      expected_admins_emails = Membership.where(
        client_id: project.id,
        role: :project_admin
      ).or(
        Membership.where(
          campaign_id: Campaign.select(:id).where(project_id: project.id),
          role: :campaign_admin
        )
      ).includes(:user).map { |membership| membership.user.email }

      described_class.call!(job_record)
      csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
      exported_emails = csv.map { |row| row[1] }.drop(1)

      expect(exported_emails).to match_array(expected_admins_emails)
    end

    it 'exports project and its campaign admins even if client_id is provided' do
      job_record = create(
        :admin_job_record,
        operation: :export_admin_with_permissions,
        data: { project_id: project.id, client_id: client.id }
      )

      expected_admins_emails = Membership.where(
        client_id: project.id,
        role: :project_admin
      ).or(
        Membership.where(
          campaign_id: Campaign.select(:id).where(project_id: project.id),
          role: :campaign_admin
        )
      ).includes(:user).map { |membership| membership.user.email }

      described_class.call!(job_record)
      csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
      exported_emails = csv.map { |row| row[1] }.drop(1)

      expect(exported_emails).to match_array(expected_admins_emails)
    end
  end

  context 'when client_id is provided' do
    let(:job_record) do
      create(:admin_job_record, operation: :export_admin_with_permissions, data: { client_id: client.id })
    end

    it 'exports correct headers' do
      described_class.call!(job_record)

      csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
      actual_first_row = csv[0]

      expect(actual_first_row).to eq(expected_header_row)
    end

    it 'exports client admins, its project admins and its campaign admins' do
      project_ids = Project.
                    where(tte_id: client.id).
                    joins(:privacy_setting).
                    where(privacy_settings: { disable_data_processing: false }).
                    pluck(:id)
      expected_admins_emails = Membership.where(
        client_id: [client.id, *project_ids],
        role: %i[project_admin client_admin]
      ).or(
        Membership.where(
          campaign_id: Campaign.select(:id).where(project_id: project_ids),
          role: :campaign_admin
        )
      ).includes(:user).map { |membership| membership.user.email }

      described_class.call!(job_record)
      csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
      exported_emails = csv.map { |row| row[1] }.drop(1)

      expect(exported_emails).to match_array(expected_admins_emails)
    end
  end
end
