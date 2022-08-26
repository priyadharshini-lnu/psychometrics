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
    # Sorting
    scope :sorted_by, lambda { |sort_key|
      # extract the sort direction from the param value.
      direction = /desc$/.match?(sort_key) ? 'desc' : 'asc'
      case sort_key.to_s
        when /^id_/
          order("users.id #{direction}")
        when /^active_/
          order("users.disabled #{direction}")
        when /^first_name_/
          order("users.first_name #{direction}")
        when /^last_name_/
          order("users.last_name #{direction}")
        when /^email_/
          order("users.email #{direction}")
        when /^role_/
          order("users.role #{direction}")
        when /^created_at_/
          order("users.created_at #{direction}")
        when /^updated_at_/
          order("users.updated_at #{direction}")
      end
    }

    # Search entity by word
    scope :search_query, lambda { |query|
      where('first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?', "%#{query}%", "%#{query}%", "%#{query}%")
    }

    # Fileter by client
    scope :with_client, lambda { |client_ids|
      joins(:memberships).where(memberships: { client_id: client_ids })
    }

    # Fileter by role
    scope :with_role, lambda { |role|
      case role
        when 'users'
          joins(:memberships).
            where(memberships: { role: [Membership::MEMBER_ROLE, Membership::MANAGER_ROLE] })
        when 'administrators'
          joining { memberships.outer }.
            where.has { role.eq(User::SUPER_ADMIN_ROLE) | memberships.role.eq(Membership::PROJECT_ADMIN_ROLE) }
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

      joins(:memberships).where(
        'users.role IN (?)', user_roles
      ).or(User.joins(:memberships).where('memberships.role IN (?)', membership_roles_indexes))
    }

    scope :client_admins, -> { joins(:memberships).where(memberships: { role: Membership::CLIENT_ADMIN_ROLE }) }
    scope :campaign_admins, -> { joins(:memberships).where(memberships: { role: Membership::CAMPAIGN_ADMIN_ROLE }) }

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
  end

  # rubocop:enable Metrics/BlockLength
end
