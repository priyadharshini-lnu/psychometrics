# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::DataReportHandlers::UserAccessReviewHandler do
  let!(:root_client) { create(:tenancy) }
  let!(:project) { create(:project, parent: root_client) }
  let!(:campaign) { create(:campaign, project: project) }

  let!(:enabled_superadmin) { create(:superadmin, email: 'enabled.superadmin@mercer.com', disabled: false) }
  let!(:disabled_superadmin) { create(:superadmin, email: 'disabled.superadmin@mercer.com', disabled: true) }

  let!(:enabled_client_admin_user) { create(:user, email: 'enabled.client.admin@mercer.com', disabled: false) }
  let!(:enabled_client_admin_membership) do
    create(:membership,
           user: enabled_client_admin_user,
           client: root_client,
           role: Membership::CLIENT_ADMIN_ROLE,
           disabled: false)
  end

  let!(:disabled_user) { create(:user, email: 'disabled.user@mercer.com', disabled: true) }
  let!(:disabled_user_membership) do
    create(:membership,
           user: disabled_user,
           client: root_client,
           role: Membership::CLIENT_ADMIN_ROLE,
           disabled: false)
  end

  let!(:disabled_membership_user) { create(:user, email: 'disabled.membership@mercer.com', disabled: false) }
  let!(:disabled_membership) do
    create(:membership,
           user: disabled_membership_user,
           client: root_client,
           role: Membership::CLIENT_ADMIN_ROLE,
           disabled: true)
  end

  let!(:non_matching_domain_user) { create(:user, email: 'non.matching@example.com', disabled: false) }
  let!(:non_matching_domain_membership) do
    create(:membership,
           user: non_matching_domain_user,
           client: root_client,
           role: Membership::CLIENT_ADMIN_ROLE,
           disabled: false)
  end

  let!(:enabled_project_admin_user) { create(:user, email: 'enabled.project.admin@mercer.com', disabled: false) }
  let!(:enabled_project_admin_membership) do
    create(:membership,
           user: enabled_project_admin_user,
           client: project,
           role: Membership::PROJECT_ADMIN_ROLE,
           disabled: false)
  end

  let!(:enabled_campaign_admin_user) { create(:user, email: 'enabled.campaign.admin@mercer.com', disabled: false) }
  let!(:enabled_campaign_admin_membership) do
    create(:membership,
           user: enabled_campaign_admin_user,
           campaign: campaign,
           role: Membership::CAMPAIGN_ADMIN_ROLE,
           disabled: false)
  end

  let!(:admin_role) { create(:admin_role, client_id: root_client.id, name: 'UAR Role') }
  let!(:membership_admin_role) do
    MembershipsAdminRole.create!(membership: enabled_client_admin_membership, admin_role: admin_role)
  end
  let!(:membership_grant) do
    create(:membership_grants,
           membership: enabled_client_admin_membership,
           data: { users: %w[read write] })
  end

  let(:data_report) do
    create(:data_report,
           owner: nil,
           scope: :global,
           report_type: :user_access_review,
           configuration: {}.to_json)
  end
  let(:data_report_job) { create(:data_report_job, data_report: data_report) }
  let(:file_path) { Rails.root.join('tmp/test_user_access_review.xlsx') }

  subject(:handler) do
    described_class.new(
      data_report: data_report,
      data_report_job: data_report_job,
      file_path: file_path
    )
  end

  before do
    allow(Settings).to receive(:dig).
      with(:data_reports, :user_access_review, :email_domains).
      and_return(['mercer.com'])
  end

  after do
    FileUtils.rm_f(file_path)
  end

  describe '.file_extension' do
    it 'returns xlsx' do
      expect(described_class.file_extension).to eq('xlsx')
    end
  end

  describe '#generate_file' do
    context 'when email_domains is empty' do
      before do
        allow(Settings).to receive(:dig).
          with(:data_reports, :user_access_review, :email_domains).
          and_return([])
      end

      it 'raises an ArgumentError with a descriptive message' do
        expect { handler.generate_file }.to raise_error(
          ArgumentError,
          'No email domains configured for UserAccessReview report'
        )
      end
    end

    it 'creates an xlsx with Usage and Roles_Permissions sheets' do
      handler.generate_file

      expect(File.exist?(file_path)).to be true

      workbook = RubyXL::Parser.parse(file_path)
      sheet_names = workbook.worksheets.map(&:sheet_name)

      expect(sheet_names).to include('Usage', 'Roles_Permissions')
    end

    it 'includes only enabled rows from allowed domains in Usage sheet' do
      handler.generate_file

      workbook = RubyXL::Parser.parse(file_path)
      usage_sheet = workbook.worksheets.find { |sheet| sheet.sheet_name == 'Usage' }

      expect(usage_sheet[0][0].value).to eq('User ID')
      expect(usage_sheet[0][2].value).to eq('Email')
      expect(usage_sheet[0][12].value).to eq('Permissions')

      emails = usage_sheet.sheet_data.rows.drop(1).filter_map { |row| row&.cells&.[](2)&.value }

      expect(emails).to include(
        enabled_superadmin.email,
        enabled_client_admin_user.email,
        enabled_project_admin_user.email,
        enabled_campaign_admin_user.email
      )
      expect(emails).not_to include(
        disabled_superadmin.email,
        disabled_user.email,
        disabled_membership_user.email,
        non_matching_domain_user.email
      )
    end

    it 'includes role permissions row for relevant memberships' do
      handler.generate_file

      workbook = RubyXL::Parser.parse(file_path)
      roles_sheet = workbook.worksheets.find { |sheet| sheet.sheet_name == 'Roles_Permissions' }

      expect(roles_sheet[0][0].value).to eq('Client ID')
      expect(roles_sheet[0][4].value).to eq('Permissions')

      first_data_row = roles_sheet.sheet_data.rows[1]
      expect(first_data_row.cells[0].value.to_i).to eq(root_client.id)
      expect(first_data_row.cells[2].value.to_i).to eq(admin_role.id)
      expect(first_data_row.cells[3].value).to eq('UAR Role')
    end
  end
end
