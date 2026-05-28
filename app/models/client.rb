# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class Client < ApplicationRecord
  audited
  include ApplicationConfigurationLoggable

  monitored_configuration_attributes :subdomain, :restricted_to_countries, :webhook, :webhook_auth_enabled,
                                     :webhook_username, :webhook_password

  include Copyable
  include RansackSearchableFields
  include GeoFilterable
  extend Mobility

  attr_writer :license_msg

  attribute :webhook, :string
  attribute :webhook_auth_enabled, :boolean
  attribute :webhook_username, :string
  attribute :webhook_password, :string

  HIERARCHY_LEVEL = {
    project: 1,
    campaign: 2,
    sub_campaign: 3
  }.freeze

  has_ancestry cache_depth: true

  # Disables single column inheritance
  self.inheritance_column = :_type_disabled
  attr_accessor :operator

  belongs_to :tte, class_name: 'Client'
  belongs_to :client, foreign_key: :tte_id, class_name: 'Client', inverse_of: :projects
  belongs_to :project_manager, class_name: 'User'
  belongs_to :creator, foreign_key: :created_by_id, class_name: 'User'
  belongs_to :modifier, foreign_key: :modified_by_id, class_name: 'User'

  has_one :retail_user, class_name: 'User'
  has_one :smtp_setting, dependent: :destroy, foreign_key: :project_id
  has_one :saml_setting, dependent: :destroy, foreign_key: :project_id
  has_one :security_setting, dependent: :destroy, foreign_key: :project_id
  has_one :design_setting, dependent: :destroy, foreign_key: :project_id
  has_one :profile_setting, dependent: :destroy, foreign_key: :project_id
  has_one :registration_setting, dependent: :destroy, foreign_key: :project_id
  has_one :power_bi_setting, dependent: :destroy, foreign_key: :project_id
  has_one :privacy_setting, dependent: :destroy, foreign_key: :project_id
  has_one :idp_setting, dependent: :destroy, foreign_key: :project_id
  has_one :client_privacy_setting, dependent: :destroy
  has_many :profile_fields, through: :profile_setting
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :end_users, class_name: 'Users::Regular', foreign_key: :project_id
  has_many :project_admin_memberships, -> { where(memberships: { role: Membership::PROJECT_ADMIN_ROLE }) },
           class_name: 'Membership'
  has_many :project_admins, through: :project_admin_memberships, source: :user, class_name: 'User'
  has_many :client_admin_memberships, -> { where(memberships: { role: Membership::CLIENT_ADMIN_ROLE }) },
           class_name: 'Membership'
  has_many :client_admins, through: :client_admin_memberships, source: :user, class_name: 'User'
  has_many :assigned_memberships, -> { assigned.distinct }, class_name: 'Membership'
  has_many :completed_memberships, -> { completed.distinct }, class_name: 'Membership'
  has_many :end_memberships, -> { where.not(memberships: { role: Membership::PROJECT_ADMIN_ROLE }) },
           class_name: 'Membership'
  has_many :managers, -> { where(memberships: { role: Membership::MANAGER_ROLE }) },
           through: :memberships, source: :user
  has_many :members, -> { where(memberships: { role: Membership::MEMBER_ROLE }) },
           through: :memberships, source: :user
  # Licenses
  has_many :project_licenses, dependent: :destroy, foreign_key: :project_id
  has_many :license_usages, dependent: :destroy
  has_many :licenses, inverse_of: :client, dependent: :destroy
  has_many :active_licenses, -> { active }, class_name: 'License'
  has_many :report_families, through: :active_licenses, source: :report_family
  has_many :available_reports, through: :report_families, source: :reports
  has_many :available_assessments, through: :report_families, source: :assessments
  # Assessments
  has_many :assessments_clients, -> { order(:position) } # on delete cascade
  has_many :assessments, through: :assessments_clients, source: :assessment
  has_many :owned_assessments, foreign_key: :owner_id, class_name: 'Assessment', dependent: :destroy
  has_many :owned_reports, foreign_key: :owner_id, class_name: 'Report', dependent: :destroy
  has_many :owned_norms, foreign_key: :owner_id, class_name: 'Norm', dependent: :destroy
  has_many :owned_dimensions, foreign_key: :owner_id, class_name: 'Dimension', dependent: :destroy
  has_many :owned_questions, foreign_key: :owner_id, class_name: 'Question', dependent: :destroy
  has_many :owned_libraries, foreign_key: :owner_id, class_name: 'Library', dependent: :destroy

  # Self Rater Assessments
  has_many :job_groups, dependent: :destroy, foreign_key: :project_id
  has_many :job_roles, through: :job_groups

  has_many :skill_groups, dependent: :destroy, foreign_key: :project_id
  has_many :skills, through: :skill_groups

  has_many :taxonomy_levels, foreign_key: :project_id, dependent: :destroy

  # Self association
  has_many :projects, -> { where(ancestry_depth: HIERARCHY_LEVEL[:project]) },
           foreign_key: :tte_id, class_name: 'Client'
  has_many :campaigns, -> { where(ancestry_depth: HIERARCHY_LEVEL[:campaign]) },
           foreign_key: :tte_id, class_name: 'Client', dependent: :destroy
  has_many :project_campaigns, class_name: 'Campaign', foreign_key: :project_id, dependent: :destroy
  has_many :sms_invites, through: :project_campaigns, dependent: :destroy

  has_many :webhooks, foreign_key: :project_id, dependent: :destroy
  has_many :registration_codes, class_name: 'RegistrationCode', foreign_key: :end_level_id, inverse_of: :end_level,
           dependent: :destroy
  has_many :project_registration_codes, class_name: 'RegistrationCode', foreign_key: :project_id, inverse_of: :project,
           dependent: :destroy
  has_many :project_users, class_name: 'User', foreign_key: 'project_id', dependent: :destroy
  has_many :integrations, dependent: :destroy, foreign_key: :project_id
  has_many :communications, dependent: :destroy, foreign_key: :sub_campaign_id
  has_many :project_assessments, dependent: :destroy, foreign_key: 'project_id'

  # TODO: use admins instead of projects_admins
  has_many :projects_admins, -> { where(memberships: { role: Membership::PROJECT_ADMIN_ROLE }) },
           through: :projects, source: :users
  has_many :idp_templates, dependent: :destroy, foreign_key: 'project_id'
  has_many :sheets, foreign_key: :project_id, dependent: :destroy
  has_many :development_actions, as: :owner, dependent: :destroy
  has_one :datasheet, class_name: 'Datasheet', foreign_key: :project_id, dependent: :destroy
  has_one :client_auditlog_export_setting, dependent: :destroy
  has_one :client_feature, dependent: :destroy
  has_one :project_feature, dependent: :destroy, foreign_key: 'project_id'

  accepts_nested_attributes_for :licenses, allow_destroy: true

  before_validation -> { self.subdomain = subdomain.downcase }, if: :subdomain?

  validates :name, :type, presence: true, length: { maximum: 50 }
  with_options if: :root? do
    validates :number, :country, :year, presence: true
    validates :project_manager, presence: true, on: :create
  end
  with_options if: :project? do
    validates :subdomain, presence: true, length: { minimum: 3, maximum: 32 }, uniqueness: true
    validates :webhook, http_url: { presence: false }
  end
  with_options if: :project? do
    validate :subdomain_format_validation
    validate :reserved_subdomain_validation
  end

  # disabled this validation as it was causing error while saving sub-campaign
  # TODO: Needs to be investigated
  # validate :relevant_reports, if: -> { report_ids.any? && end_level? }
  validate :allowed_data, if: -> { operator }

  before_validation :ensure_subdomain, if: :retail?
  before_create lambda {
    self.migrated = true
  }, if: :project?
  before_create :inherit_tenant_id, if: -> { parent_id.present? }
  after_create :set_self_as_tenant, unless: -> { parent_id.present? }
  after_create :set_hogan_group_name, if: :project?
  after_create :create_smtp_setting, if: :project?
  after_create :create_security_setting, if: :project?
  after_create :create_design_setting, if: :project?
  after_create :create_profile_setting, if: :project?
  after_create :create_registration_setting, if: :project?
  after_create :create_privacy_setting, if: :project?
  after_create :create_client_privacy_setting, if: :root?
  after_create :create_idp_setting, if: :project?
  after_create :create_client_features
  after_create :create_project_features, if: :project?
  after_commit :set_tte, if: -> { parent_id.present? }, on: :update
  after_commit :set_end_level, if: -> { parent_id.present? }, on: %i[create update]

  # Type of client.
  # Retail - is client who bought some product
  enum :type, { partner: 0, corporate: 1, distributer: 2, associate: 3, tte: 4, retail: 5, other: 6 }
  enum :applicable_level, { project: 0, campaign: 1, sub_campaign: 2 }, suffix: :level

  delegate :details, to: :saml_setting, prefix: true
  delegate :saml_login_allowed?, :saml_enforced?, to: :saml_setting
  delegate :tfa_enabled?, to: :security_setting
  delegate :mask_identity_for_pearson?, :mask_identity_for_saville?, :mask_identity_for_hogan?,
           :mask_identity_for_iiht?, :mask_identity_for_examus?,
           :mask_identity_for_mettl?, :mask_identity_for_skillvue?, :mask_identity_for_yoodli?,
           :mask_identity_for_mhs?,
           :custom_privacy_consent, to: :privacy_setting
  delegate :idp?, :ai_assistants?, :global_skills?, :sms_notification?,
           :ai_assisted_idp?, to: :project_feature, allow_nil: true

  scope :enabled, -> { where('NOT (clients.disabled = ? AND archived = ?)', true, true) }
  scope :has_integration, ->(name) { joins(:integrations).merge(Integration.where(name: name).active) }
  scope :resource_disabled, ->(value) { where(disabled: value) }
  scope :not_archived, -> { where.not(archived: true) }
  scope :tenancies, ->(*_p) { roots }
  scope :not_retails, -> { where.not(type: :retail) }
  scope :by_report_family_assessment, lambda { |assessment|
                                        joins(:report_families).
                                          where(report_families: { id: assessment.report_family_ids })
                                      }
  scope :end_level, -> { where(end_level: true) }
  scope :projects_of, lambda { |client_id|
                        find_by(id: client_id)&.descendants&.at_depth(Client::HIERARCHY_LEVEL[:project]) || all
                      }
  scope :campaigns_of, lambda { |client_id|
                         find_by(id: client_id).descendants.at_depth(Client::HIERARCHY_LEVEL[:campaign])
                       }
  scope :descendants_of_arr, ->(client_ids) { where('clients.ancestry ~ ?', "(/|^)(#{client_ids.join('|')})(/|$)") }
  scope :projects, -> { where(ancestry_depth: HIERARCHY_LEVEL[:project]) }
  scope :campaigns, -> { where(ancestry_depth: HIERARCHY_LEVEL[:campaign]) }

  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  scope :restricted_clients, lambda { |country|
    where(tte_id: nil).
      where("restricted_to_countries IS NOT NULL AND restricted_to_countries != '{}'").
      where('? != ALL(restricted_to_countries)', country)
  }

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    where.not(id: restricted_client_subquery)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name applicable_level disabled tte_id]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields projects_of resource_disabled search_query has_integration]
  end

  def current_privacy_policy_version
    return Settings.privacy_policy_version unless privacy_setting.custom_privacy_consent?

    privacy_setting.custom_privacy_policy_version
  end

  def iiht_config
    integrations.iiht.first&.iiht_config
  end

  def mettl_config
    integrations.mettl.first&.mettl_config
  end

  def skillvue_config
    integrations.skillvue.first&.skillvue_config
  end

  def microsite_config
    integrations.microsite.first&.microsite_config
  end

  def saml_setting
    super || build_saml_setting
  end

  def available_locales
    return locales if locales.any?

    [I18n.default_locale]
  end

  def license_msg
    @license_msg ||= {}
  end

  def self.options_for_select
    all.map { |client| [client.decorate.display_name, client.id] }
  end

  def ensure_subdomain
    self.subdomain = generate_subdomain if subdomain.blank?
  end

  def tenancy?
    root?
  end

  def final_children
    descendants.where(end_level: true)
  end

  def depth_symbol
    Client::HIERARCHY_LEVEL.key(depth) || :root
  end

  def project?
    depth == HIERARCHY_LEVEL[:project]
  end

  def campaign?
    depth == HIERARCHY_LEVEL[:campaign]
  end

  def sub_campaign?
    depth == HIERARCHY_LEVEL[:sub_campaign]
  end

  def subtenancy?
    campaign? || sub_campaign?
  end

  def prime_project?
    project_level? && project?
  end

  def deep_project?
    (campaign? && project.campaign_level?) || (sub_campaign? && project.sub_campaign_level?)
  end

  def active?
    !archived?
  end

  def client
    root
  end

  def project
    return self if project?
    return parent if campaign?
    return parent.parent if sub_campaign?

    nil
  end

  def campaign
    return self if campaign?
    return parent if sub_campaign?

    nil
  end

  def set_hogan_group_name
    self.hogan_group_name = generate_hogan_group_name
    save!
  end

  def assessment_universal_links_enabled?(assessment_id)
    assessments_clients.find_by(assessment_id: assessment_id)&.enable_universal_links?
  end

  def has_assessment_key?(assessment_id)
    !!assessments_clients.find_by(assessment_id: assessment_id)&.assessment_key
  end

  def log_attribute_for_delete
    slice(:name, :subdomain)
  end

  def usable_license_id(project = nil)
    scope = active_licenses.select(&:enough_licenses?)
    return scope.pluck(:id) if project.blank?

    license_ids = scope.map(&:id)
    License.
      left_outer_joins(:project_licenses).
      where(id: license_ids).
      where('licenses.is_project_specific = FALSE OR project_licenses.project_id = ?', project.id).
      distinct.
      pluck(:id)
  end

  def hogan_provider
    provider_from_hogan_integration || Settings.secrets.hogan[:default_provider]
  end

  def simulation_user_assessment_exist?
    SimulationUserAssessment.joins(:user_assessment).exists?(
      user_assessments: { campaign_id: project_campaigns.ids }
    )
  end

  def feature_enabled?(feature_flag)
    client_feature.send(:"#{feature_flag}?")
  end

  def project_feature_enabled?(feature_flag)
    return false unless project?

    project_feature&.send(:"#{feature_flag}?") || false
  end

  def geo_restricted?
    restricted_to_countries.present?
  end

  def check_geo_restriction!
    return if Settings.features.disable_geo_restriction

    return unless geo_restricted?
    raise Geo::Exceptions::RestrictedEndpoint if Current.user_country.blank?
    raise Geo::Exceptions::RestrictedEndpoint unless restricted_to_countries.include?(Current.user_country)
  end

  private

  def generate_hogan_group_name
    [
      ENV.fetch('SERVER_NAME', nil),
      client.name.gsub(/[^0-9A-Za-z\s]/, ''),
      project.id
    ].compact.join('-')
  end

  def generate_subdomain
    loop do
      subdomain = "retail_#{Random.rand(99_999)}#{Time.now.to_i}"
      break subdomain unless Client.exists?(subdomain: subdomain)
    end
  end

  def subdomain_format_validation
    return if /^[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?$/.match?(subdomain)

    errors.add(:subdomain, 'Wrong subdomain format')
  end

  def reserved_subdomain_validation
    return if Settings.reserved_subdomains.exclude? subdomain

    errors.add(:subdomain, "Subdomain #{subdomain} is reserved")
  end

  def inherit_tenant_id
    self.tenant_id = root.id
    self.tte_id = root.id
  end

  def set_tte
    update_columns(tte_id: root.id, tenant_id: root.id)
  end

  def set_self_as_tenant
    update_column(:tenant_id, id)
  end

  def set_end_level
    update_column(:end_level, true) if prime_project? || deep_project?
  end

  def relevant_reports
    valid_ids = root.available_reports.distinct.pluck(:id) if prime_project?
    valid_ids ||= project.report_ids
    errors.add(:report_ids) if (valid_ids & report_ids).to_set != report_ids.to_set
  end

  def allowed_data
    if operator.is?(:project_admin) && root?
      errors.add(:base)
    end
  end

  def provider_from_hogan_integration
    config = integrations.hogan.active.last&.config

    config['provider'] if config.present?
  end

  def create_client_features
    build_client_feature.save
  end

  def create_project_features
    build_project_feature.save
  end
end
# rubocop:enable Metrics/ClassLength
