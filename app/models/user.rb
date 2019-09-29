# frozen_string_literal: true

# == Schema Information
#
# Table name: users
#
#  id                             :integer          not null, primary key
#  email                          :string           default(""), not null
#  encrypted_password             :string           default(""), not null
#  reset_password_token           :string
#  reset_password_sent_at         :datetime
#  remember_created_at            :datetime
#  sign_in_count                  :integer          default(0), not null
#  current_sign_in_at             :datetime
#  last_sign_in_at                :datetime
#  current_sign_in_ip             :inet
#  last_sign_in_ip                :inet
#  created_at                     :datetime         not null
#  updated_at                     :datetime         not null
#  first_name                     :string
#  last_name                      :string
#  disabled                       :boolean          default(FALSE)
#  role                           :string           default("Users::Regular")
#  invitation_token               :string
#  invitation_created_at          :datetime
#  invitation_sent_at             :datetime
#  invitation_accepted_at         :datetime
#  invitation_limit               :integer
#  invited_by_type                :string
#  invited_by_id                  :integer
#  invitations_count              :integer          default(0)
#  authentication_token           :string(30)
#  is_anonym                      :boolean          default(FALSE)
#  grants                         :jsonb
#  created_by_id                  :integer
#  modified_by_id                 :integer
#  spoof_token                    :string
#  second_factor_attempts_count   :integer          default: 0
#  encrypted_otp_secret_key       :string
#  encrypted_otp_secret_key_iv    :string
#  encrypted_otp_secret_key_salt  :string
#  direct_otp                     :string
#  direct_otp_sent_at             :datetime
#  totp_timestamp                 :timestamp
#

class User < ApplicationRecord
  include UserScopes
  include UserValidations

  # Roles constant
  SUPER_ADMIN_ROLE = 'Users::SuperAdmin'
  REGULAR_ROLE = 'Users::Regular'
  ADMIN_ROLE = 'Users::Admin'

  USER_ROLES = {
    superadmin: SUPER_ADMIN_ROLE,
    regular: REGULAR_ROLE,
    admin: ADMIN_ROLE
  }.freeze

  USER_ROLES_SCOPES = {
    administration: [USER_ROLES.key(SUPER_ADMIN_ROLE), Membership::PROJECT_ADMIN_ROLE, Membership::CLIENT_ADMIN_ROLE],
    user: [USER_ROLES.key(REGULAR_ROLE), Membership::MANAGER_ROLE, Membership::MEMBER_ROLE]
  }.freeze

  # Contain information about ability to manage list of roles
  USER_ROLES_HIERARCHY = {
    superadmin: USER_ROLES.values,
    regular: Membership::MEMBERSHIP_ROLES
  }.freeze

  DEFAULT_ADMIN_GRANTS = {
    assessments: %w[view],
    reports: %w[view],
    communications: %w[view manage]
  }.with_indifferent_access.freeze

  DEFAULT_PROJECT_ADMIN_GRANTS = {
    assessments: %w[view],
    communications: %w[view manage]
  }.with_indifferent_access.freeze

  ADMIN_GRANTS = {
    norms: %w[view manage],
    dimensions: %w[view manage],
    clients: %w[manage design],
    assessments: %w[view manage assign export import],
    translations: %w[export import],
    reports: %w[view manage],
    questions: %w[view manage],
    libraries: %w[view manage],
    communications: %w[view manage],
    projects: %w[view manage],
    assigns: %w[view]
  }.with_indifferent_access.freeze

  # Authentication
  devise :two_factor_authenticatable, :invitable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable,
         :timeoutable, request_keys: { subdomain: false }

  attr_accessor :create_by_invite
  attr_accessor :terms
  # HRIS data
  attr_accessor :hris_data
  attr_accessor :current_membership

  self.inheritance_column = :role

  belongs_to :creator, foreign_key: :created_by_id, class_name: 'User'
  belongs_to :modifier, foreign_key: :modified_by_id, class_name: 'User'
  belongs_to :project, class_name: 'Client'
  has_many :memberships, inverse_of: :user # on delete cascade
  has_many :clients, through: :memberships
  has_many :ttes, through: :clients
  has_many :project_admin_clients, -> { where(memberships: { role: Membership::PROJECT_ADMIN_ROLE }) },
           through: :memberships, source: 'client'
  has_many :project_admin_clients_ttes, through: :project_admin_clients, source: 'tte', class_name: 'Client'
  has_many :communications, foreign_key: 'creator_id'
  has_many :client_admin_clients, -> { where(memberships: { role: Membership::CLIENT_ADMIN_ROLE }) },
           through: :memberships, source: 'client'
  has_many :client_admin_clients_ttes, through: :client_admin_clients, source: 'tte', class_name: 'Client'
  has_many :client_admin_projects, through: :client_admin_clients, source: 'projects', class_name: 'Client'
  has_many :license_usages, inverse_of: :user
  has_many :api_keys, inverse_of: :user
  has_many :users_assessments, inverse_of: :user
  has_many :assessments, through: :users_assessments
  has_many :users_reports, inverse_of: :user
  has_many :evaluated_results, foreign_key: 'subject_id', class_name: 'UsersResult'
  has_many :evaluation_results, foreign_key: 'evaluator_id', class_name: 'UsersResult'
  has_many :campaigns_users
  has_many :reminder_histories, class_name: 'Threesixty::ReminderHistory', dependent: :delete_all

  accepts_nested_attributes_for :memberships

  scope :client_admins, -> { joins(:memberships).where(memberships: { role: Membership::CLIENT_ADMIN_ROLE }) }
  before_save :ensure_authentication_token
  validates :email, uniqueness: { scope: %i[project_id] }
  # Rules are copy-pasted from lib/devise/models/validatable.rb
  validates_format_of     :email,
                          with: Devise.email_regexp, allow_blank: true, if: :will_save_change_to_email?
  validates_presence_of   :email
  validates_presence_of     :password, if: :password_required?
  validates_confirmation_of :password, if: :password_required?
  validates_length_of       :password, within: Devise.password_length, allow_blank: true
  validates :role, inclusion: { in: ::User::USER_ROLES.values }, presence: true, allow_nil: true
  validate :validate_grants

  has_one_time_password(encrypted: true)

  # Overridden method to send direct OTP codes. This is automatically called when a user logs in
  # unless they have TOTP enabled.
  def send_two_factor_authentication_code(code)
    SendTwoFactorCodeJob.perform_later(self, code)
  end

  # By default, second factor authentication is required for each user.
  # Override here to change that.
  def need_two_factor_authentication?(__request = nil)
    return true unless is?(:regular)

    project ? project.second_factor_enabled? : false
  end

  # To set TOTP to disabled
  def totp_enabled?
    false
  end

  def reset_second_factor_attempts_counter!
    update!(second_factor_attempts_count: 0)
  end

  # We won't set password, we will send inviting
  def password_required?
    return false if new_record? && create_by_invite

    !persisted? || password || password_confirmation
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

  def ensure_authentication_token
    self.authentication_token = generate_authentication_token if authentication_token.blank?
  end

  # If user was already created and was invited by mail (with link to set password)
  #   Then we just send him mail with link to new Client
  # Else we send him mail with link to set password
  def invite!(invited_by = nil, invited_to_id = nil, options = {})
    return unless user_member_role_exists?(invited_to_id) || is?(:superadmin)
    if accepted_or_not_invited? && !sign_in_count.zero? && !is?(:superadmin, :member)
      return InvitationMailer.link_to_client(id, invited_to_id).deliver_later
    end

    # Customizing default mail of devise_inviteable
    # Couse it's gem not support to chagen invite link
    #   Where we need to set subdomain of Client
    #   Where client was invited
    self.skip_invitation = true
    super(invited_by, options)

    if is?(:superadmin, :client_admin, :project_admin)
      InvitationMailer.invite_superadmin(id, @raw_invitation_token).deliver_later
    else
      InvitationMailer.invite(id, invited_to_id, @raw_invitation_token).deliver_later
    end
  end

  def has_grant?(scope, grant)
    memberships.any? { |m| m.has_grant?(scope, grant) }
  end

  def superadmin?
    role == 'Users::SuperAdmin'
  end

  private

  def generate_invitation_token
    super
    encrypted_token = Rails.application.message_verifier(Rails.application.secrets.secret_token_for_generate).
                      generate(@raw_invitation_token)
    self.encrypted_invitation_raw = encrypted_token
  end

  def generate_authentication_token
    loop do
      token = Devise.friendly_token
      break token unless User.exists?(authentication_token: token)
    end
  end

  def user_member_role_exists?(client_id)
    memberships.where.not(role: :member).where(client_id: client_id).exists?
  end

  # @deprecated
  def validate_grants
    return if grants.nil?

    valid = grants.is_a?(Hash) && (grants.keys - ADMIN_GRANTS.keys).empty?
    if valid
      grants.each do |k, v|
        valid = (v - ADMIN_GRANTS[k]).empty?
        break unless valid
      end
    end
    errors.add(:grants, :invalid) unless valid
  end

  class << self
    # White list scopes for Ransack
    def ransackable_scopes(_auth_object = nil)
      %i[hris_data_cont role_scope_in]
    end

    # Available role for the filter form
    #
    def options_for_with_role
      %w[all users administration]
    end

    # Try find User in Subdomain scope
    def find_for_authentication(warden_conditions)
      # Cut from Subdomain part of expected Subdomain
      subdomain = warden_conditions[:subdomain]&.gsub(/\.{0,1}#{Settings.subdomain}/, '')
      if subdomain.present?
        project = Client.find_by(subdomain: subdomain)
        Users::Regular.enabled.
          identified.
          joins(:clients).
          where.has do
          project_id.eq(project.id) &
            email.eq(warden_conditions[:email]&.downcase) &
            clients.subdomain.eq(subdomain) &
            clients.disabled.not_eq(true)
        end .
          first
      else
        enabled.
          identified.
          where(project_id: nil, role: ['Users::Admin', 'Users::SuperAdmin']).
          where('email = LOWER(?)', warden_conditions[:email]).
          first # If Subdomain not presented going normally
      end
    end
  end
end
