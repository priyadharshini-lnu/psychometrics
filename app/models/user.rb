# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  reset_password_token   :string
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :inet
#  last_sign_in_ip        :inet
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  first_name             :string
#  last_name              :string
#  disabled               :boolean          default(FALSE)
#  role                   :enum             default("user")
#

class User < ApplicationRecord
  # Authentication
  devise :invitable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Roles constant
  USER_ROLES = {
      superadmin: 'superadmin',
      admin: 'admin',
      manager: 'manager',
      user: 'user'
  }.freeze

  GROUP_USER_ROLES = {
      administrators: USER_ROLES.slice(:superadmin, :admin).keys,
      users:          USER_ROLES.slice(:manager, :user).keys
  }.freeze

  validates :first_name, :last_name, :email, :role, presence: true
  validates :first_name, :last_name, :email, length: { maximum: 100 }, allow_blank: true
  validates :email, uniqueness: true
  validates_with EmailValidator, fields: [:email], allow_nil: true
  validates :role, inclusion: { in: USER_ROLES.values }, allow_nil: true

  enum role: USER_ROLES

  def full_name
    if first_name.present? || last_name.present?
      "#{first_name} #{last_name}".to_s
    else
      email
    end
  end

  # We won't set password, we will send inviting
  def password_required?
    return false if new_record?
    super
  end

  def can?(*roles)
    roles.each do |role|
      case role
      when :superadmin then return true if superadmin?
      when :admin then return true if admin?
      when :manager then return true if manager?
      when :user then return true if user?
      else raise 'Not impl'
      end
    end
    false
  end

  def active?
    !disabled
  end

  filterrific(
    default_filter_params: {
      sorted_by: 'id_desc',
      with_role: 'all'
    },
    available_filters: [
      :sorted_by,
      :search_query,
      :with_client,
      :with_role
    ]
  )

  # Sorting
  scope :sorted_by, lambda { |sort_key|
    # extract the sort direction from the param value.
    direction = (sort_key =~ /desc$/) ? 'desc' : 'asc'
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
    when /^client_name_/
      # TODO: Uncomment when will be created client's model
      # joins(:client).select('users.*, clients.name AS client_name').order("client_name #{ direction }")
    when /^role_/
      order("users.role #{direction}")
    end
  }

  # Search entity by word
  scope :search_query, lambda { |query|
    where('first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?', "%#{query}%", "%#{query}%", "%#{query}%")
  }

  # Fileter by client
  scope :with_client, lambda { |client_id|
    # TODO: Uncomment when will be created client's model
    # where(client_id: client_id)
  }

  # Fileter by role
  scope :with_role, lambda { |role|
    if role == 'users'
      where(role: GROUP_USER_ROLES[:users])
    elsif role == 'administrators'
      where(role: GROUP_USER_ROLES[:administrators])
    end
  }

  # Available role for the filter form
  #
  def self.options_for_with_role
    %w(all users administrators)
  end
end
