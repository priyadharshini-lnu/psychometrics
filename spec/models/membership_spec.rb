# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Membership, type: :model do
  let(:project) { create(:project) }
  let!(:client_membership) do
    create(:client_admin_membership, client: project.client)
  end
  let!(:project_membership) do
    create(:project_admin_membership, client: project)
  end
  let!(:client_admin_role) do
    create(
      :admin_role,
      permissions: { clients: %w[view view_licenses reset_password] }
    )
  end
  let!(:project_admin_role) do
    create(
      :admin_role,
      permissions: { clients: %w[view view_licenses reset_password] }
    )
  end

  describe '#has_grant?' do
    context 'with admin role' do
      context 'with client membership' do
        it 'returns true if has specific client admin role grants' do
          client_membership.admin_role_ids = [client_admin_role.id]
          expect(
            client_membership.user.has_permission?(:clients, :view, project_id: client_membership.client_id)
          ).to eq(true)
          expect(
            client_membership.user.has_permission?(:clients, :view_licenses, project_id: client_membership.client_id)
          ).to eq(true)
        end

        it 'returns false unless have specific client admin role grants' do
          expect(
            client_membership.user.has_permission?(:clients, :reset_password, project_id: client_membership.client_id)
          ).to eq(false)
        end
      end

      context 'with project membership' do
        it 'returns true if has specific project admin role grants' do
          expect(
            project_membership.user.has_permission?(:clients, :view, project_id: project_membership.client_id)
          ).to eq(true)
        end

        it 'returns false unless have specific project admin role grants' do
          expect(
            project_membership.user.has_permission?(:clients, :view_licenses, project_id: project_membership.client_id)
          ).to eq(false)
          expect(
            project_membership.user.has_permission?(:clients, :reset_password, project_id: project_membership.client_id)
          ).to eq(false)
        end
      end
    end
  end
end
