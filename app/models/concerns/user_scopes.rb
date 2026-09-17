# frozen_string_literal: true

module UserScopes
  extend ActiveSupport::Concern

  # rubocop:disable Metrics/BlockLength
  included do
    scope :enabled, -> { where.not(disabled: true) }
    scope :identified, -> { where(is_anonym: false) }
    scope :superadmins, -> { where(role: User::USER_ROLES[:superadmin]) }
    scope :enabled_super_admins, -> { superadmins.where(disabled: false) }
    scope :managers, -> { where(role: User::USER_ROLES[:manager]) }

    # Search entity by word
    scope :search_query, lambda { |query|
      where('CONCAT(first_name, \' \', last_name) ILIKE ? OR email ILIKE ?', "%#{query}%", "%#{query}%")
    }

    # Fileter by client
    scope :with_client, lambda { |client_ids|
      joins(:memberships).where(memberships: { client_id: client_ids })
    }

    scope :with_access_to_campaign, lambda { |campaign_id|
      campaign = Campaign.find(campaign_id)
      client_ids = [campaign.client.id, campaign.project_id]
      left_joins(:memberships).where(
        %{
          (memberships.client_id IN (:client_ids) AND memberships.campaign_id IS NULL)
          OR memberships.campaign_id = :campaign_id OR users.role = :role
        },
        client_ids: client_ids, campaign_id: campaign.id, role: User::SUPER_ADMIN_ROLE
      ).where.not(role: User::APPLICATION_ROLE).distinct
    }

    scope :with_campaign_user, lambda { |campaign_id|
      campaign = Campaign.find(campaign_id)
      left_joins(:campaign_users).
        where({ campaign_users: { campaign_id: campaign.id } }).
        where.not(role: User::APPLICATION_ROLE).
        distinct
    }

    # Fileter by role
    scope :with_role, lambda { |role|
      case role
        when 'users'
          joins(:memberships).
            where(memberships: { role: [Membership::MEMBER_ROLE, Membership::MANAGER_ROLE] })
        when 'administrators'
          left_outer_joins(:memberships).where(
            'users.role = :super_admin OR memberships.role = :project_admin',
            super_admin: User::SUPER_ADMIN_ROLE,
            project_admin: Membership.roles[Membership::PROJECT_ADMIN_ROLE]
          )
      end
    }

    scope :hris_data_cont, lambda { |data|
      data = JSON.parse(data) if data.is_a?(String)
      return if data.blank?

      where('users.hris @> ?', data.to_json)
    }

    scope :role_scope_in, lambda { |*roles|
      user_roles = User::USER_ROLES.values & roles
      membership_roles_indexes = roles.map do |role|
        Membership.roles[role]
      end

      left_joins(:memberships).where(
        'memberships.role IN (?) OR users.role IN (?)', membership_roles_indexes, user_roles
      ).distinct
    }

    scope :client_admins, -> { joins(:memberships).where(memberships: { role: Membership::CLIENT_ADMIN_ROLE }) }
    scope :campaign_admins, -> { joins(:memberships).where(memberships: { role: Membership::CAMPAIGN_ADMIN_ROLE }) }

    # Client/project/campaign admins for a campaign's hierarchy -- CC-recipient candidate list, mirrors
    # Facades::Administration::Communication#fetch_admin_users (legacy).
    scope :admins_for_campaign, lambda { |campaign_id|
      campaign = Campaign.find(campaign_id)
      client_id = campaign.project&.parent_id
      project_id = campaign.project_id

      joins(:memberships).
        where(disabled: false, memberships: { disabled: false }).
        where(
          '(memberships.client_id = :client_id AND memberships.role = :client_admin_role) OR
           (memberships.client_id = :project_id AND memberships.role = :project_admin_role) OR
           (memberships.campaign_id = :campaign_id AND memberships.role = :campaign_admin_role)',
          client_id: client_id, project_id: project_id, campaign_id: campaign.id,
          client_admin_role: Membership.roles[Membership::CLIENT_ADMIN_ROLE],
          project_admin_role: Membership.roles[Membership::PROJECT_ADMIN_ROLE],
          campaign_admin_role: Membership.roles[Membership::CAMPAIGN_ADMIN_ROLE]
        ).distinct
    }

    scope :eq_id, ->(id) { where(id: id) }
    scope :filterable_fields, lambda { |search_term|
      if (search_term !~ /\D/) && search_term.present?
        eq_id(search_term).or(search_query(search_term))
      else
        search_query(search_term)
      end
    }
    scope :sort_by_full_name_asc, -> { order(first_name: :asc, last_name: :asc) }
    scope :sort_by_full_name_desc, -> { order(first_name: :desc, last_name: :desc) }
    scope :admins, ->(_) { where(project_id: nil) }
    scope :global_assessors, -> { where(global_assessor: true).where.not(role: User::APPLICATION_ROLE) }
    scope :applications, -> { where(role: User::APPLICATION_ROLE) }
    scope :not_application, -> { where.not(role: User::APPLICATION_ROLE) }
  end

  # rubocop:enable Metrics/BlockLength
end
