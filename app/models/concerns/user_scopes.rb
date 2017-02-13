module UserScopes
  extend ActiveSupport::Concern

  included do
    # Sorting
    scope :sorted_by, lambda { |sort_key|
      # extract the sort direction from the param value.
      direction = sort_key =~ /desc$/ ? 'desc' : 'asc'
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
      if role == 'users'
        where(role: USER_ROLES_SCOPES[:user])
      elsif role == 'administrators'
        where(role: USER_ROLES_SCOPES[:administration])
      end
    }

    scope :exclude_ids, lambda { |ids|
      ids = ids.split(',') if ids.is_a?(String)
      ids = (ids || []).reject(&:blank?).compact
      where.not(id: ids)
    }
    scope :include_ids, lambda { |ids|
      ids = ids.split(',') if ids.is_a?(String)
      ids = (ids || []).reject(&:blank?).compact
      where(id: ids)
    }

    scope :hris_data_cont, lambda { |data|
      data = JSON.parse(data) if data.is_a?(String)
      return if data.blank?
      where('users.hris @> ?', data.to_json)
    }

    scope :role_scope_in, lambda { |role|
      if role == 'users'
        where(role: USER_ROLES_SCOPES[:user])
      elsif role == 'administration'
        where(role: USER_ROLES_SCOPES[:administration])
      end
    }
  end
end
