# frozen_string_literal: true

require 'rails_helper'

describe UserRoles do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user) }
  let(:project) { create(:project) }
  let(:project_1) { create(:project) }
  let(:membership_grant_without_report_view) { create(:membership_grants, data: { campaigns: %w[view] }) }
  let(:membership_grant_with_report_view) { create(:membership_grants, data: { reports: %w[view] }) }
  let!(:regular_membership) { create(:membership, user: user) }
  let!(:pa_with_reports_view_grant) do
    create(:project_admin_membership, user: user, grants: membership_grant_with_report_view, client: project)
  end
  let!(:pa_without_reports_view_grant) do
    create(:project_admin_membership, user: user, grants: membership_grant_without_report_view, client: project_1)
  end

  context '#is?' do
    it 'checks user role' do
      current_user.is?(:superadmin)
    end
  end

  context '#has_user_membership_grant?' do
    context 'Project Admin' do
      it 'returns false if PA do not have report view grant for project membership' do
        expect(user.has_user_membership_grant?(:reports, :view, pa_without_reports_view_grant.client_id)).to eq(false)
      end

      it 'returns true if PA have report view grant for project membership' do
        expect(
          user.reload.has_user_membership_grant?(:reports, :view, pa_with_reports_view_grant.client_id)
        ).to eq(true)
      end

      it 'returns true if PA dont have report view grant but it has CA membership for project with same grant' do
        _ca_membership = create(:client_admin_membership, user: user,
          grants: membership_grant_with_report_view, client: project_1.parent)
        expect(
          user.reload.has_user_membership_grant?(:reports, :view, pa_without_reports_view_grant.client_id)
        ).to eq(true)
      end

      it 'returns false for PA and CA membership of user for project do not have report view grant' do
        _ca_membership = create(:client_admin_membership, user: user,
          grants: membership_grant_without_report_view, client: project_1.parent)
        expect(
          user.reload.has_user_membership_grant?(:reports, :view, pa_without_reports_view_grant.client_id)
        ).to eq(false)
      end
    end
  end
end
