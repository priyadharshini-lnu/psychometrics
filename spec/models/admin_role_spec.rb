# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminRole, type: :model do
  it 'provides only grantable permission for project_admin' do
    admin_role = create(
      :admin_role,
      permissions: {
        'clients' => %w[view view_licenses],
        'projects' => %w[view manage manage_admins manage_users]
      }
    )
    expect(admin_role.user_role_specific_permissions('project_admin')).to eq({
      'clients' => ['view'], 'projects' => %w[view manage_users]
    })
  end

  it 'provides only grantable permission for campaign_admin' do
    admin_role = create(
      :admin_role,
      permissions: {
        'clients' => %w[view view_licenses],
        'projects' => %w[view manage manage_admins manage_users],
        'campaigns' => %w[view manage manage_admins manage_users]
      }
    )
    expect(admin_role.user_role_specific_permissions('campaign_admin')).to eq({
      'campaigns' => %w[view manage manage_users]
    })
  end

  it 'returns all permissions for client_admin' do
    admin_role = create(
      :admin_role,
      permissions: {
        'clients' => %w[view view_licenses],
        'projects' => %w[view manage manage_admins manage_users],
        'campaigns' => %w[view manage manage_admins manage_users]
      }
    )
    expect(admin_role.user_role_specific_permissions('client_admin')).to eq({
      'clients' => %w[view view_licenses],
      'projects' => %w[view manage manage_admins manage_users],
      'campaigns' => %w[view manage manage_admins manage_users]
    })
  end
end
