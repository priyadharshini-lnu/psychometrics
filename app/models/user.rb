# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class User < ApplicationRecord
  include GeoFilterable

  audited except: %i[encrypted_password encrypted_invitation_raw authentication_token spoof_token]

  include UserScopes
  include UserRoles
  include UserValidations
  include TwoFactorAuthenticatable
  include Users::SecuritySetting

  DEFAULT_ADMIN_GRANTS = {
    clients: %w[view],
    projects: %w[view manage manage_admins manage_users],
    campaigns: %w[view manage manage_users manage_options manage_messages stats],
    communications: %w[view manage],
    results: %w[view_report report_data raw_responses scores]
  }.with_indifferent_access.freeze

  DEFAULT_PROJECT_ADMIN_GRANTS = {
    clients: %w[view],
    projects: %w[view],
    campaigns: %w[view manage manage_users manage_options manage_messages manage_admins stats],
    communications: %w[view manage],
    assessors: %w[view manage],
    results: %w[view_report report_data raw_responses scores]
  }.with_indifferent_access.freeze

  DEFAULT_CAMPAIGN_ADMIN_GRANTS = {
    clients: %w[view],
    projects: %w[view],
    communications: %w[view manage],
    campaigns: %w[view manage manage_users manage_options show manage_messages stats],
    results: %w[view_report report_data raw_responses scores]
  }.with_indifferent_access.freeze

  ADMIN_GRANTS = {
    clients: %w[view view_licenses manage],
    projects: %w[view manage manage_admins manage_users manage_admins],
    norms: %w[view manage],
    dimensions: %w[view manage],
    assessments: %w[view manage],
    questions: %w[view manage],
    libraries: %w[view manage],
    communications: %w[view manage],
    reports: %w[view manage],
    results: %w[view_report report_data raw_responses scores],
    campaign: %w[view show manage manage_users manage_options manage_messages manage_admins stats],
    assessors: %w[view manage],
    registration_codes: %w[view manage],
    sms_invites: %w[view manage],
    datasheet: %w[view manage],
    messages: %w[email instructions options]
  }.with_indifferent_access.freeze

  # overrides required for devise_security
  # DO NOT MOVE THESE METHODS BELLOW devise
  def self.uniqueness_validation_of_login?
    true
  end

  def self.devise_validation_enabled?
    true
  end

  # Authentication
  devise :saml_authenticatable, :two_factor_authenticatable, :invitable, :database_authenticatable,
         :magic_link_authenticatable, :registerable, :recoverable, :rememberable, :trackable,
         :secure_validatable, :password_archivable, :password_expirable, :lockable, :timeoutable,
         :session_limitable,
         request_keys: { subdomain: false }
  prepend SubdomainSessionLimitable

  attr_accessor :create_by_invite, :terms, :current_membership
  # HRIS data
  attr_accessor :hris_data

  self.inheritance_column = :role

  belongs_to :creator, foreign_key: :created_by_id, class_name: 'User'
  belongs_to :modifier, foreign_key: :modified_by_id, class_name: 'User'
  belongs_to :project, class_name: 'Client'
  belongs_to :manager, class_name: 'User'

  tenant_config has_global_records: true, optional: true
  include Tenantable

  has_many :profile_fields, through: :project
  has_many :memberships, inverse_of: :user # on delete cascade
  has_many :clients, through: :memberships
  has_many :ttes, through: :clients
  has_many :project_admin_clients, -> { where(memberships: { role: Membership::PROJECT_ADMIN_ROLE, disabled: false }) },
           through: :memberships, source: 'client'
  has_many :project_admin_clients_ttes, through: :project_admin_clients, source: 'tte', class_name: 'Client'
  has_many :communications, foreign_key: 'creator_id'
  has_many :communications_users, dependent: :destroy
  has_many :client_admin_clients, -> { where(memberships: { role: Membership::CLIENT_ADMIN_ROLE, disabled: false }) },
           through: :memberships, source: 'client'
  has_many :campaign_admin_campaigns, lambda {
    where(memberships: { role: Membership::CAMPAIGN_ADMIN_ROLE, disabled: false })
  }, through: :memberships, source: 'campaign'
  has_many :campaign_admin_clients, lambda {
    where(memberships: { role: Membership::CAMPAIGN_ADMIN_ROLE, disabled: false })
  }, through: :memberships, source: 'client'
  has_many :client_assessor_clients,
           -> { where(memberships: { role: Membership::CLIENT_ASSESSOR_ROLE, disabled: false }) },
           through: :memberships, source: 'client'
  has_many :campaign_admin_clients_ttes, through: :campaign_admin_clients, source: 'tte', class_name: 'Client'
  has_many :client_admin_clients_ttes, through: :client_admin_clients, source: 'tte', class_name: 'Client'
  has_many :client_admin_projects, through: :client_admin_clients, source: 'projects', class_name: 'Client'
  has_many :license_usages, inverse_of: :user
  has_many :api_keys, inverse_of: :user, dependent: :destroy
  has_many :user_assessments, inverse_of: :subject, foreign_key: :subject_id, dependent: :destroy
  has_many :self_user_assessments, lambda {
    UserAssessment.self_assessment
  }, inverse_of: :subject, foreign_key: :subject_id, class_name: 'UserAssessment'
  has_many :assessments, through: :user_assessments
  has_many :user_reports, inverse_of: :user, dependent: :destroy
  has_many :evaluated_assessments, foreign_key: :subject_id, class_name: 'UserAssessment'
  has_many :evaluation_assessments, foreign_key: :evaluator_id, class_name: 'UserAssessment'
  has_many :evaluated_results, through: :evaluated_assessments, source: :users_result
  has_many :evaluation_results, through: :evaluation_assessments, source: :users_result
  has_many :campaign_users, dependent: :destroy
  has_many :system_check_sessions, dependent: :destroy
  has_many :reminder_histories, class_name: 'Threesixty::ReminderHistory', dependent: :delete_all
  has_one :hogan_credential, -> { active }, dependent: :destroy
  has_one :oracle_credential, dependent: :destroy
  has_many  :available_client_admin_reports,
            through: :client_admin_clients,
            source: :available_reports,
            class_name: 'Report'
  has_many :campaigns, through: :campaign_users
  has_many :assessors, dependent: :destroy
  has_many :assessors_campaings, through: :assessors, source: :campaign
  has_many :report_approvals, dependent: :destroy
  has_many :highlights, dependent: :destroy
  has_many :privacy_consents, dependent: :destroy
  has_many :user_availability_dates, dependent: :destroy
  has_many :user_availability_days, through: :user_availability_dates
  has_many :user_bookings
  has_many :campaign_factor_values, dependent: :destroy
  has_many :bulk_reports
  has_many :user_saved_filters
  has_many :temporary_uploads, dependent: :destroy

  has_one :security_setting, through: :project
  has_one :user_profile
  has_many :profile_field_values, through: :user_profile
  has_one :active_user_idp_plan, -> { active }, class_name: 'UserIdpPlan'
  has_many :user_idp_plans, dependent: :destroy
  has_many :user_idp_development_actions, through: :active_user_idp_plan, dependent: :destroy
  has_many :user_idp_skills, through: :active_user_idp_plan, dependent: :destroy
  has_many :idp_template_skills, through: :active_user_idp_plan

  accepts_nested_attributes_for :memberships

  validates :email, uniqueness: { scope: %i[project_id] }
  # Rules are copy-pasted from lib/devise/models/validatable.rb
  validates :email, format: { with: Devise.email_regexp, allow_blank: true, if: :will_save_change_to_email? }
  validates :email, presence: true
  validates :role, inclusion: { in: UserRoles::USER_ROLES.values }, presence: true, allow_nil: true

  before_save :ensure_authentication_token
  before_save do
    self.email = email.downcase
  end

  after_create :create_user_profile
  after_commit :update_disabled_at, on: :update

  has_one_time_password(encrypted: true)

  acts_as_tagger

  delegate :subdomain, to: :project, allow_nil: true
  delegate :age, :gender, :timezone, :photo, :photo_url, :locale, to: :user_profile, allow_nil: true
  delegate :email, to: :manager, prefix: true, allow_nil: true

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    case name
      when UserRoles::REGULAR_ROLE
        joins(:project).
          merge(Client.projects.where.not(tte_id: restricted_client_subquery))

      when UserRoles::ADMIN_ROLE
        joins(:memberships).
          where.not(memberships: { client_id: restricted_client_subquery })

      else
        all
    end
  end

  def accessible_client_ids
    ActsAsTenant.without_tenant do
      association(:client_admin_clients).reset
      association(:project_admin_clients).reset
      association(:campaign_admin_clients).reset
      association(:client_assessor_clients).reset
      (
        client_admin_client_ids +
        project_admin_clients_tte_ids +
        campaign_admin_clients_tte_ids +
        client_assessor_client_ids
      ).uniq.compact
    end
  end

  def clients_with_admin_access
    ActsAsTenant.without_tenant do
      return Client.tenancies.enabled if is?(:superadmin)

      Client.enabled.where(id: accessible_client_ids)
    end
  end

  def sole_admin_client
    return nil if is?(:superadmin)

    clients = clients_with_admin_access
    clients.first if clients.one?
  end

  def campaign_user_external_id(campaign_id)
    return unless campaign_id

    campaign_users.find_by(campaign_id: campaign_id)&.external_id
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id full_name first_name last_name name email role global_assessor is_anonym]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[campaign_users]
  end

  def maskable_identity(mask: false)
    @maskable_identity ||= Users::MaskableIdentity.new(self, mask: mask)
  end

  def authenticated_sign_in_url
    token = encode_passwordless_token(
      expires_at: applicable_security_setting.magic_link_expiry_in_seconds.seconds.from_now
    )
    Utility::Url.generate(
      :users_sign_in_link_url,
      id: id,
      subdomain: subdomain,
      user: { email: email, token: token, remember_me: false }
    )
  end

  def workshop_subject(workshop_invite)
    workshop_subjects ||= WorkshopSubject.where(user_id: id, campaign_id: workshop_invite.campaign_id).
                          joins(:workshop_invited_subject).
                          where(workshop_invited_subjects: { workshop_invite: workshop_invite.id }).
                          order(:updated_at)

    workshop_subjects.participatable.last || workshop_subjects.last
  end

  def workshop(workshop_invite)
    workshop_subject(workshop_invite)&.workshop
  end

  def send_reset_password_instructions
    super unless disabled?
  end

  def send_unlock_instructions
    super
    SiemLogger.log_security_event!('TokenIssuance',
                                   actor_name: SiemLogger.user_identifier(email, id),
                                   context: "User: #{SiemLogger.user_identifier(email, id)}",
                                   msg: "Unlock token issued for #{SiemLogger.user_identifier(email, id)}",
                                   authentication_channel: 'Unlock')
  end

  def self.send_reset_password_instructions(recoverable)
    recoverable.send_reset_password_instructions if recoverable.persisted?
  end

  def privacy_consent_required?
    return false if admin?

    project.privacy_setting.privacy_consent && !privacy_consents.exists?(
      version: project.current_privacy_policy_version
    )
  end

  def accessible_records(resource_class, permissions)
    return resource_class.all if is?(:superadmin)

    permissions = Array.wrap(permissions).map { |p| p.split('.') }
    campaign_ids = ::Administration::CampaignPolicy::Scope.new(self, Campaign).resolve.select do |campaign|
      permissions.any? { |resource, permission| has_permission?(resource, permission, campaign_id: campaign.id) }
    end
    resource_class.joins(:campaign).where(campaigns: { id: campaign_ids })
  end

  def ensure_authentication_token
    self.authentication_token = generate_authentication_token if authentication_token.blank?
  end

  # If user was already created and was invited by mail (with link to set password)
  #   Then we just send him mail with link to new Client
  # Else we send him mail with link to set password
  # We will not send invitation mail twice for the same user
  def invite!(invited_by = nil, membership = nil, options = {})
    return unless is?(:superadmin, :client_admin, :project_admin, :campaign_admin)

    if accepted_or_not_invited? && !sign_in_count.zero?
      return InvitationMailer.link_to_client(id, membership).deliver_later
    end

    return if invited_to_sign_up?

    # Customizing default mail of devise_inviteable
    # Couse it's gem not support to change invite link
    #   Where we need to set subdomain of Client
    #   Where client was invited
    self.skip_invitation = true
    super(invited_by, options)

    InvitationMailer.invite_admin(id, @raw_invitation_token).deliver_later

    SiemLogger.log_security_event!('TokenIssuance',
                                   actor_name: SiemLogger.user_identifier(email, id),
                                   context: "User: #{SiemLogger.user_identifier(email, id)}",
                                   msg: "Invitation token issued for #{SiemLogger.user_identifier(email, id)}",
                                   authentication_channel: 'Invitation')
  end

  def tenancy
    project.parent
  end

  def name
    decorate.full_name
  end

  # Overridden Devise class method

  def log_attributes
    slice(:id, :email)
  end

  def can_receives_communication?
    !disabled?
  end

  def active_for_authentication?
    super && !disabled?
  end

  def owner_ids
    [client_admin_client_ids, project_admin_client_ids, campaign_admin_client_ids].flatten.uniq
  end

  private

  def email_validation
    URI::MailTo::EMAIL_REGEXP
  end

  def update_disabled_at
    return unless saved_change_to_disabled?

    update_column(:disabled_at, disabled? ? Time.current : nil)
  end

  def generate_invitation_token
    super
    encrypted_token = Rails.application.message_verifier(Settings.secrets.secret_token_for_generate).
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
    memberships.where.not(role: :member).exists?(client_id: client_id)
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

  def block_from_invitation?
    false
  end

  ransacker :full_name do |parent|
    Arel::Nodes::InfixOperation.new(
      '||',
      Arel::Nodes::InfixOperation.new(
        '||', parent.table[:first_name], Arel::Nodes.build_quoted(' ')
      ),
      parent.table[:last_name]
    )
  end

  class << self
    # White list scopes for Ransack
    def ransackable_scopes(_auth_object = nil)
      %i[hris_data_cont role_scope_in filterable_fields admins search_query with_access_to_campaign
         with_campaign_user]
    end

    # Available role for the filter form
    #
    def options_for_with_role
      %w[all users administration]
    end

    def find_user_with_membership(project, subdomain, warden_conditions)
      Users::Regular.enabled.identified.
        joins(:clients).
        where(project_id: project.id).
        where(email: warden_conditions[:email]&.downcase).
        where(clients: { subdomain: subdomain }).
        where.not(clients: { disabled: true }).
        first
    end

    def find_user_for_new_campaign(project, warden_conditions)
      Users::Regular.enabled.identified.
        where(project_id: project.id).
        where(email: warden_conditions[:email]&.downcase).
        first
    end

    # Try find User in Subdomain scope
    def find_for_authentication(warden_conditions)
      # Cut from Subdomain part of expected Subdomain
      subdomain = warden_conditions[:subdomain]&.gsub(/\.{0,1}#{Settings.subdomain}/, '')
      if subdomain.present? && !AdminSubdomain.client_admin?(subdomain)
        project = Client.find_by(subdomain: subdomain)
        membership = Membership.join_user.find_by(
          users: { email: warden_conditions[:email]&.downcase }, client_id: project.id, role: 'member'
        )
        if membership
          find_user_with_membership(project, subdomain, warden_conditions)
        else
          find_user_for_new_campaign(project, warden_conditions)
        end
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

# rubocop:enable Metrics/ClassLength
