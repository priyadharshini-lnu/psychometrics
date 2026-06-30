# frozen_string_literal: true

module AdminAuth
  class ResolveClientAccess < BaseCommand
    ADMIN_ROLES = %w[client_admin project_admin campaign_admin].freeze
    ENTRY_ROLES = (ADMIN_ROLES + [Membership::CLIENT_ASSESSOR_ROLE]).freeze

    def initialize(user, client)
      @user = user
      @client = client
    end

    def call
      return broadcast(:error, :invalid_user) if user.blank?
      return broadcast(:error, :invalid_client) unless client&.active?
      return broadcast(:error, :user_disabled) unless user.active_for_authentication?

      access = determine_access
      return broadcast(:error, :no_access) unless access[:has_access]

      broadcast(:ok, access)
    end

    private

    attr_reader :user, :client

    def client_subtree_ids
      @client_subtree_ids ||= client.subtree_ids
    end

    def determine_access
      # Superadmin gets access only if they have an actual membership on this client.
      if user.is?(:superadmin)
        memberships = find_entry_memberships.load
        roles = memberships.map(&:role).uniq

        return {
          has_access: memberships.any?,
          highest_role: ENTRY_ROLES.find { |r| roles.include?(r) },
          roles: roles,
          memberships: memberships
        }
      end

      memberships = find_entry_memberships
      roles = memberships.distinct.pluck(:role)

      has_assessor_role = user_is_assessor_for_client?
      roles << 'assessor' if has_assessor_role

      highest_role = ENTRY_ROLES.find { |r| roles.include?(r) }
      highest_role ||= 'assessor' if has_assessor_role

      {
        has_access: highest_role.present?,
        highest_role: highest_role,
        roles: roles,
        memberships: memberships
      }
    end

    def find_entry_memberships
      user.memberships.
        joins('LEFT JOIN campaigns ON memberships.campaign_id = campaigns.id').
        where(admin_membership_condition).
        where(role: ENTRY_ROLES)
    end

    def admin_membership_condition
      [
        'memberships.client_id IN (?) OR campaigns.project_id IN (?)',
        client_subtree_ids,
        client_subtree_ids
      ]
    end

    def user_is_assessor_for_client?
      return false unless user.respond_to?(:assessors)

      user.assessors.joins(:campaign).exists?(
        campaigns: { project_id: client_subtree_ids }
      )
    end
  end
end
