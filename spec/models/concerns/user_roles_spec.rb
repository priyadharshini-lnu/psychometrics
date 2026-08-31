# frozen_string_literal: true

require 'rails_helper'

describe UserRoles do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user) }
  let(:project) { create(:project) }
  let(:membership_grant_with_report_view) { create(:membership_grants, data: { reports: %w[view] }) }
  let(:membership_grant_without_report_view) { create(:membership_grants, data: { campaigns: %w[view] }) }

  context '#has_permission?' do
    it 'returns true if passed project_id is of project and its project or client memebrship has specific grant' do
      project_membership = create(:project_admin_membership, user: user,
        grants: membership_grant_with_report_view, client: project)
      _client_membership = create(:client_admin_membership, user: user,
        grants: membership_grant_without_report_view, client: project.client)

      expect(
        project_membership.user.has_permission?(:reports, :view, project_id: project_membership.client_id)
      ).to eq(true)
    end

    it "returns true if passed project_id is of project and user doesn't have project grant but has client grant" do
      project_membership = create(:project_admin_membership, user: user,
        grants: membership_grant_without_report_view, client: project)
      _client_membership = create(:client_admin_membership, user: user,
        grants: membership_grant_with_report_view, client: project.client)

      expect(
        project_membership.user.has_permission?(:reports, :view, project_id: project_membership.client_id)
      ).to eq(true)
    end

    it 'returns false if passed project_id is of project and its project or client memebrship has not specific grant' do
      project_membership = create(:project_admin_membership, user: user,
        grants: membership_grant_without_report_view, client: project)
      _client_membership = create(:client_admin_membership, user: user,
        grants: membership_grant_without_report_view, client: project.client)

      expect(
        project_membership.user.has_permission?(:reports, :view, project_id: project_membership.client_id)
      ).to eq(false)
    end

    it 'returns true if passed project_id is of tenancy and has specific grant' do
      client_memebership_with_report_view_grant = create(
        :client_admin_membership, grants: membership_grant_with_report_view, client: project.client
      )

      expect(
        client_memebership_with_report_view_grant.user.
          has_permission?(:reports, :view, project_id: client_memebership_with_report_view_grant.client_id)
      ).to eq(true)
    end

    it 'returns false if passed project_id is of tenancy and has not specific grant' do
      client_memebership_without_report_view_grant = create(
        :client_admin_membership, grants: membership_grant_with_report_view, client: project.client
      )

      expect(
        client_memebership_without_report_view_grant.user.
          has_permission?(:reports, :view, project_id: client_memebership_without_report_view_grant.client_id)
      ).to eq(true)
    end
  end

  context '#is?' do
    it 'checks user role' do
      expect(current_user.is?(:superadmin)).to eq(true)
    end
  end

  context '#support_admin?' do
    let(:user) { create(:superadmin, email: 'Support.Admin@Example.com') }

    it 'is true when the email is in the allowlist (case-insensitive)' do
      allow(Settings).to receive(:support_admins).and_return('other@example.com, support.admin@example.com')

      expect(user.support_admin?).to eq(true)
    end

    it 'is false when the email is not in the allowlist' do
      allow(Settings).to receive(:support_admins).and_return('someone@example.com')

      expect(user.support_admin?).to eq(false)
    end

    it 'is false when the allowlist is blank' do
      allow(Settings).to receive(:support_admins).and_return(nil)

      expect(user.support_admin?).to eq(false)
    end
  end
end
