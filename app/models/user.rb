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
#  role                   :string           default("Users::Regular")
#  invitation_token       :string
#  invitation_created_at  :datetime
#  invitation_sent_at     :datetime
#  invitation_accepted_at :datetime
#  invitation_limit       :integer
#  invited_by_type        :string
#  invited_by_id          :integer
#  invitations_count      :integer          default(0)
#  authentication_token   :string(30)
#  is_anonym              :boolean          default(FALSE)
#  grants                 :jsonb
#

class User < ApplicationRecord
  # Roles constant
  SUPER_ADMIN_ROLE = 'Users::SuperAdmin'.freeze
  REGULAR_ROLE = 'Users::Regular'.freeze

  USER_ROLES = {
      superadmin: SUPER_ADMIN_ROLE,
      regular: REGULAR_ROLE
  }.freeze

  USER_ROLES_SCOPES = {
      administration: [USER_ROLES.key(SUPER_ADMIN_ROLE), Membership::ADMIN_ROLE],
      user:           [USER_ROLES.key(REGULAR_ROLE), Membership::MANAGER_ROLE, Membership::MEMBER_ROLE]
  }.freeze

  # Contain information about ability to manage list of roles
  USER_ROLES_HIERARCHY = {
      superadmin: USER_ROLES.values,
      regular: Membership::MEMBERSHIP_ROLES
  }.freeze

  DEFAULT_ADMIN_GRANTS = {
      assessments: { view: true },
      reports: { view: true },
      clients: { view: true },
      communications: { view: true, manage: true }
  }.freeze

  # Scopes
  include UserScopes

  # Authentication
  devise :invitable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :timeoutable, request_keys: { subdomain: false }

  attr_accessor :create_by_invite
  attr_accessor :terms
  # HRIS data
  attr_accessor :hris_data
  attr_accessor :current_membership

  self.inheritance_column = :role

  has_many :memberships, inverse_of: :user
  has_many :clients, through: :memberships
  has_many :admin_clients, -> { where(memberships: { role: Membership::ADMIN_ROLE }) }, through: :memberships, source: 'client'
  accepts_nested_attributes_for :memberships

  include UserValidations

  before_save :ensure_authentication_token
  validates :email, uniqueness: true
  validates :role, inclusion: { in: ::User::USER_ROLES.values }, presence: true, allow_nil: true
  validate :validate_grants

  scope :enabled, -> { where.not(disabled: true) }
  scope :identified, -> { where(is_anonym: false) }
  scope :superadmins, -> { where(role: User::USER_ROLES[:superadmin]) }
  scope :managers, -> { where(role: User::USER_ROLES[:manager]) }

  # We won't set password, we will send inviting
  def password_required?
    return false if new_record? && create_by_invite
    super
  end

  # Time to strong sign out
  def timeout_in
    return 1.year if is?(:superadmin) || is_anonym?
    super
  end

  def is?(*roles)
    roles.map!(&:to_sym)
    arr = if current_membership
            [current_membership.role.to_sym]
          else
            [USER_ROLES.key(role)] + memberships.map { |m| m.role.to_sym }
          end
    (arr & roles).any?
  end

  # Return devise scope
  # :administration, :user
  def role_scope
    USER_ROLES_SCOPES.each do |scope, roles|
      break scope if is?(*roles)
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

  class << self
    # White list scopes for Ransack
    def ransackable_scopes(_auth_object = nil)
      [:hris_data_cont, :role_scope_in]
    end

    # Available role for the filter form
    #
    def options_for_with_role
      %w(all users administration)
    end

    def human_role(role)
      I18n.t("activerecord.attributes.user.roles.#{USER_ROLES.key(role)}")
    end

    # Try find User in Subdomain scope
    def find_for_authentication(warden_conditions)
      # Cut from Subdomain part of expected Subdomain
      subdomain = warden_conditions[:subdomain] && warden_conditions[:subdomain].gsub(/\.{0,1}#{Settings.subdomain}/, '')
      if subdomain.present?
        enabled.
          identified.
          joins(:clients).
          where.has { email.eq(warden_conditions[:email]) & clients.subdomain.eq(subdomain) & clients.disabled.not_eq(true) }.
          first
      else
        enabled.
          identified.
          where(email: warden_conditions[:email]).
          first # If Subdomain not presented going normally
      end
    end
  end

  def ensure_authentication_token
    if authentication_token.blank?
      self.authentication_token = generate_authentication_token
    end
  end

  # If user was already created and was invited by mail (with link to set password)
  #   Then we just send him mail with link to new Client
  # Else we send him mail with link to set password
  def invite!(invited_by = nil, invited_to_id = nil, options = {})
    if accepted_or_not_invited? && !sign_in_count.zero?
      InvitationMailer.link_to_client(id, invited_to_id).deliver_later
    else
      # Customizing default mail of devise_inviteable
      # Couse it's gem not support to chagen invite link
      #   Where we need to set subdomain of Client
      #   Where client was invited
      self.skip_invitation = true
      super(invited_by, options)
      InvitationMailer.invite(id, invited_to_id, @raw_invitation_token).deliver_later
    end
  end

  def has_grant?(*args)
    return false if grants.nil?
    args.map!(&:to_s)
    grants.dig(*args).present?
  end

  private

  def generate_authentication_token
    loop do
      token = Devise.friendly_token
      break token unless User.exists?(authentication_token: token)
    end
  end

  def validate_grants
    return if grants.nil? || grants.is_a?(Hash)
    errors.add(:grants, :invalid)
  end
end
