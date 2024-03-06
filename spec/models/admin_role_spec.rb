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
    membership = create(:membership, role: 'project_admin')
    expect(admin_role.user_role_specific_permissions(membership)).to eq({
      'clients' => ['view'], 'projects' => %w[view manage_users]
    })
  end

  it 'provides only grantable permission for campaign_admin' do
    admin_role = create(
      :admin_role,
      permissions: {
        'clients' => %w[view view_licenses],
        'projects' => %w[view manage manage_admins manage_users],
        'campaigns' => %w[view manage manage_admins manage_users],
        'workshops' => %w[view manage]
      }
    )
    membership = create(:membership, role: 'campaign_admin', campaign: create(:campaign))
    expect(admin_role.user_role_specific_permissions(membership)).to eq({
      'campaigns' => %w[view manage manage_users],
      'workshops' => %w[view manage]
    })
  end

  it 'provides only grantable permission for threesixty campaign_admin' do
    admin_role = create(
      :admin_role,
      permissions: {
        'clients' => %w[view view_licenses],
        'projects' => %w[view manage manage_admins manage_users],
        'campaigns' => %w[view manage manage_admins manage_users],
        'workshops' => %w[view manage]
      }
    )
    membership = create(:membership, role: 'campaign_admin', campaign: create(:campaign, type: :threesixty))
    expect(admin_role.user_role_specific_permissions(membership)).to eq({
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
    membership = create(:membership, role: 'client_admin', client: create(:tenancy))
    expect(admin_role.user_role_specific_permissions(membership)).to eq({
      'clients' => %w[view view_licenses],
      'projects' => %w[view manage manage_admins manage_users],
      'campaigns' => %w[view manage manage_admins manage_users]
    })
  end
end
