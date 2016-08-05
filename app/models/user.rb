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
#  invitation_token       :string
#  invitation_created_at  :datetime
#  invitation_sent_at     :datetime
#  invitation_accepted_at :datetime
#  invitation_limit       :integer
#  invited_by_type        :string
#  invited_by_id          :integer
#  invitations_count      :integer          default(0)
#

class User < ApplicationRecord
  # Authentication
  devise :invitable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # User, who try update or create entity
  attr_accessor :operator

  # Roles constant
  USER_ROLES = {
      superadmin: 'superadmin',
      admin: 'admin',
      manager: 'manager',
      user: 'user'
  }.freeze

  USER_ROLES_SCOPES = {
      administrator: USER_ROLES.slice(:superadmin, :admin).keys,
      user:          USER_ROLES.slice(:manager, :user).keys
  }.freeze

  # Contain information about ability to manage list of roles
  USER_ROLES_HIERARCHY = {
    superadmin: USER_ROLES.keys,
    admin: [:manager, :user],
    manager: [:user],
    user: []
  }.freeze

  USER_ROLES_MAPS = {
    'Super Admin' => :superadmin,
    'Client Admin' => :admin,
    'Manager' => :manager,
    'User' => :user
  }.freeze

  USER_IMPORT_RULES = {
    email: /Email Address|Email|E-mail/i,
    first_name: 'First Name',
    last_name: 'Last Name',
    clients: /Company|Memberships|Clients|Client/i,
    role: 'Role',
    evaluator_name: /Evaluator name/i,
    evaluators_email_address: /Evaluators email address/i,
    relationship: /Relationship/i,
    business_unit: /Business unit/i,
    department: /Department/i,
    job_title: /Job title/i,
    nationality: /Nationality/i,
    gender: /Gender/i
  }.freeze

  USER_HRIS = %i(evaluator_name evaluators_email_address relationship business_unit department job_title nationality gender).freeze

  store :hris, accessors: USER_HRIS

  has_many :memberships
  has_many :clients, through: :memberships

  validates :first_name, :last_name, :email, :role, presence: true
  validates :first_name, :last_name, :email, length: { maximum: 100 }, allow_blank: true
  validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i }
  validates :role, inclusion: { in: USER_ROLES.values }, allow_nil: true

  enum role: USER_ROLES

  before_validation :check_operator_can_manage, if: :role_changed?

  # We won't set password, we will send inviting
  def password_required?
    return false if new_record?
    super
  end

  def is?(*roles)
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

  # Return true if current user/admin has ability to manage passed user
  def can_manage?(user)
    user.role && can_manage.include?(user.role.try(:to_sym))
  end

  # Return list of roles, that can manage
  def can_manage
    (USER_ROLES_HIERARCHY[role.to_sym] || [])
  end

  # Return devise scope
  # :administrator, :user
  def role_scope
    USER_ROLES_SCOPES.each do |scope, roles|
      break scope if is?(*roles)
    end
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
  scope :with_client, lambda { |client_id|
    joins(:clients).where(clients: { id: client_id })
  }

  # Fileter by role
  scope :with_role, lambda { |role|
    if role == 'users'
      where(role: USER_ROLES_SCOPES[:user])
    elsif role == 'administrators'
      where(role: USER_ROLES_SCOPES[:administrator])
    end
  }

  class << self
    # Available role for the filter form
    #
    def options_for_with_role
      %w(all users administrators)
    end
  end

  private

  def check_operator_can_manage
    errors.add(:role, :invalid) if operator && !operator.try(:can_manage?, self)
  end
end
