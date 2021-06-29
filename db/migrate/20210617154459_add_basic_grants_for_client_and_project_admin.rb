# frozen_string_literal: true

class AddBasicGrantsForClientAndProjectAdmin < ActiveRecord::Migration[5.2]
  def change
    client_admin_grants = {
      clients: %w[view view_licenses design],
      results: %w[view_report report_data raw_responses scores],
      projects: %w[view manage manage_admins manage_users],
      campaigns: %w[view show manage manage_users manage_options manage_messages],
      communications: %w[view manage]
    }

    project_admin_grants = {
      clients: %w[view],
      results: %w[view_report report_data raw_responses scores],
      projects: %w[view manage_users],
      campaigns: %w[view manage manage_users manage_options manage_messages],
      communications: %w[view manage]
    }

    MembershipGrant.joins(:membership).where(
      memberships: { role: Membership::CLIENT_ADMIN_ROLE }
    ).update_all(data: client_admin_grants)

    MembershipGrant.joins(:membership).where(
      memberships: { role: Membership::PROJECT_ADMIN_ROLE }
    ).update_all(data: project_admin_grants)
  end
end
