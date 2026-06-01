# frozen_string_literal: true

module AdminAuth
  class HighestClientRoles
    ROLE_PRIORITY = %w[client_admin project_admin campaign_admin].freeze

    def self.for_user(user, clients)
      return {} if user.blank? || clients.blank?
      return superadmin_roles(clients) if user.is?(:superadmin)

      subtree_to_tenancy = build_subtree_mapping(clients)
      all_subtree_ids = subtree_to_tenancy.keys

      memberships = user.memberships.
                    where(client_id: all_subtree_ids, role: ROLE_PRIORITY).
                    pluck(:client_id, :role)

      memberships.each_with_object({}) do |(client_id, role), roles|
        tenancy_id = subtree_to_tenancy[client_id]
        next unless tenancy_id

        current_priority = ROLE_PRIORITY.index(roles[tenancy_id])
        new_priority = ROLE_PRIORITY.index(role)
        next unless new_priority
        next if current_priority && current_priority <= new_priority

        roles[tenancy_id] = role
      end
    end

    def self.superadmin_roles(clients)
      clients.each_with_object({}) { |c, h| h[c.id] = 'superadmin' }
    end

    def self.build_subtree_mapping(clients)
      clients.each_with_object({}) do |client, map|
        client.subtree_ids.each { |id| map[id] = client.id }
      end
    end

    private_class_method :superadmin_roles, :build_subtree_mapping
  end
end
