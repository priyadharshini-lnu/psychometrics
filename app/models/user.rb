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
#  role                   :string           default("Users::Member")
#  invitation_token       :string
#  invitation_created_at  :datetime
#  invitation_sent_at     :datetime
#  invitation_accepted_at :datetime
#  invitation_limit       :integer
#  invited_by_type        :string
#  invited_by_id          :integer
#  invitations_count      :integer          default(0)
#  hris                   :jsonb
#

class User < ApplicationRecord
  # Authentication
  devise :invitable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :timeoutable

  # User, who try update or create entity
  attr_accessor :operator
  # HRIS data
  attr_accessor :hris_data

  self.inheritance_column = :role

  # Roles constant
  USER_ROLES = {
      superadmin: 'Users::SuperAdmin',
      admin: 'Users::Admin',
      manager: 'Users::Manager',
      member: 'Users::Member',
  }.freeze

  USER_ROLES_SCOPES = {
      administration: USER_ROLES.slice(:superadmin, :admin).values,
      user:          USER_ROLES.slice(:manager, :member).values
  }.freeze

  # Contain information about ability to manage list of roles
  USER_ROLES_HIERARCHY = {
    superadmin: USER_ROLES.values,
    admin: [USER_ROLES[:admin], USER_ROLES[:manager], USER_ROLES[:member]],
    manager: [USER_ROLES[:member]],
    user: []
  }.freeze

  has_many :memberships
  has_many :clients, through: :memberships
  accepts_nested_attributes_for :memberships

  has_many :assigns, dependent: :destroy
  has_many :assessments, through: :assigns

  validates :first_name, :last_name, :email, :role, presence: true
  validates :first_name, :last_name, :email, length: { maximum: 100 }, allow_blank: true
  validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i }
  validates :role, inclusion: { in: USER_ROLES.values }, allow_nil: true

  before_validation :check_operator_can_manage, if: :role_changed?

  # We won't set password, we will send inviting
  def password_required?
    return false if new_record? && operator.present?
    super
  end

  def is?(*roles)
    ([USER_ROLES.key(role)] & roles).any?
  end

  # Return devise scope
  # :administration, :user
  def role_scope
    USER_ROLES_SCOPES.each do |scope, roles|
      break scope if is?(*roles.map { |role| USER_ROLES.key(role) })
    end
  end

  # Return true if current user/admin has ability to manage passed user
  def can_manage?(user)
    user.role && can_manage.include?(user.role)
  end

  # Return list of roles, that can manage
  def can_manage
    (USER_ROLES_HIERARCHY[USER_ROLES.key(role)] || [])
  end

  # GET Ids of clients which Operator can manage
  def manage_client_ids
    client_ids
  end

  # SET Operator can manage users only from own client (company)
  def manage_client_ids=(value)
    ids = (value.reject(&:blank?) || []).map(&:to_i)
    # Check which clients can be managed by operator
    manage_ids = operator.try(:manage_clients, ids) || []
    self.client_ids = (client_ids + manage_ids).uniq
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

  def hris_data=(data)
    self.hris = {}
    data.values.each do |d|
      next if d['key'].blank?
      hris[d['key']] = d['value']
    end
  end

  class << self
    def ransackable_scopes(_auth_object = nil)
      [:hris_data_cont, :role_scope_in, :exclude_ids, :include_ids]
    end

    # Available role for the filter form
    #
    def options_for_with_role
      %w(all users administration)
    end

    def human_role(role)
      I18n.t("activerecord.attributes.user.roles.#{USER_ROLES.key(role)}")
    end
  end

  private

  def check_operator_can_manage
    errors.add(:role, :invalid) if operator && !operator.try(:can_manage?, self)
  end
end
