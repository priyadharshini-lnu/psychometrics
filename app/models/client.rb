# frozen_string_literal: true

# == Schema Information
#
# Table name: clients
#
#  id                 :integer          not null, primary key
#  name               :string
#  subdomain          :string
#  logo               :string
#  design             :json
#  disabled           :boolean          default(FALSE)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  background         :string
#  type               :integer          default("partner")
#  licenses_count     :integer          default(0)
#  number             :string
#  country            :string
#  year               :integer
#  applicable_level   :integer          default("project")
#  account_manager_id :integer
#  project_manager_id :integer
#  archived           :boolean          default(FALSE)
#  tte_id             :integer
#  created_by_id      :integer
#  modified_by_id     :integer
#  ancestry           :string
#  ancestry_depth     :integer          default(0)
#  end_level          :boolean          default(FALSE)
#

# rubocop:disable Metrics/ClassLength
class Client < ApplicationRecord
  include Copyable
  attr_writer :license_msg

  HIERARCHY_LEVEL = {
    project: 1,
    campaign: 2,
    sub_campaign: 3
  }.freeze

  has_ancestry cache_depth: true
  store :design, accessors: [:background_color]

  # Disables single column inheritance
  self.inheritance_column = :_type_disabled
  attr_accessor :operator

  belongs_to :tte, class_name: 'Client'
  belongs_to :account_manager, class_name: 'User'
  belongs_to :project_manager, class_name: 'User'
  belongs_to :creator, foreign_key: :created_by_id, class_name: 'User'
  belongs_to :modifier, foreign_key: :modified_by_id, class_name: 'User'

  # Users and Memberships
  has_one :retail_user, class_name: 'User'
  has_many :memberships # on delete cascade
  has_many :users, through: :memberships
  has_many :assigns, through: :memberships, source: :assigns
  has_many :project_admin_memberships, -> { where(memberships: { role: Membership::PROJECT_ADMIN_ROLE }) },
           source: :membership,
           class_name: 'Membership'
  has_many :project_admins, through: :project_admin_memberships, source: :user, class_name: 'User'
  has_many :client_admin_memberships, -> { where(memberships: { role: Membership::CLIENT_ADMIN_ROLE }) },
           source: :membership, class_name: 'Membership'
  has_many :client_admins, through: :client_admin_memberships, source: :user, class_name: 'User'
  has_many :assigned_memberships, -> { assigned.distinct }, source: :membership, class_name: 'Membership'
  has_many :completed_memberships, -> { completed.distinct }, source: :membership, class_name: 'Membership'
  has_many :end_memberships, -> { where.not(memberships: { role: Membership::PROJECT_ADMIN_ROLE }) },
           source: :membership, class_name: 'Membership'
  has_many :managers, -> { where(memberships: { role: Membership::MANAGER_ROLE }) },
           through: :memberships, source: :user
  has_many :members, -> { where(memberships: { role: Membership::MEMBER_ROLE }) },
           through: :memberships, source: :user
  # Licenses
  has_many :license_usages
  has_many :licenses, inverse_of: :client, dependent: :destroy
  has_many :active_licenses, -> { active }, class_name: 'License'
  # Reports
  has_many :clients_reports # on delete cascade
  has_many :reports, through: :clients_reports, source: :report
  has_many :report_families, through: :active_licenses, source: :report_family
  has_many :available_reports, through: :report_families, source: :reports
  has_many :available_assessments, through: :report_families, source: :assessments
  # Assessments
  has_many :assessments_clients, -> { order(:position) } # on delete cascade
  has_many :assessments, through: :assessments_clients, source: :assessment

  # Self association
  has_many :projects, -> { where(ancestry_depth: HIERARCHY_LEVEL[:project]) },
           foreign_key: :tte_id, class_name: 'Client'
  has_many :campaigns, -> { where(ancestry_depth: HIERARCHY_LEVEL[:campaign]) },
           foreign_key: :tte_id, class_name: 'Client'
  has_many :sub_campaigns, -> { where(ancestry_depth: HIERARCHY_LEVEL[:sub_campaign]) },
           foreign_key: :tte_id, class_name: 'Client'
  has_many :project_campaigns, class_name: 'Campaign', foreign_key: :project_id

  has_many :norms
  has_many :dimensions
  has_many :registration_codes, class_name: 'RegistrationCode', foreign_key: :end_level_id, inverse_of: :end_level
  has_many :project_registration_codes, class_name: 'RegistrationCode', foreign_key: :project_id, inverse_of: :project

  # TODO: use admins instead of projects_admins
  has_many :projects_admins, -> { where(memberships: { role: Membership::PROJECT_ADMIN_ROLE }) },
           through: :projects, source: :users

  has_one :datasheet, foreign_key: :project_id, dependent: :destroy
  has_one :privacy_link, dependent: :destroy

  accepts_nested_attributes_for :licenses, allow_destroy: true
  accepts_nested_attributes_for :privacy_link, allow_destroy: true

  before_validation -> { self.subdomain = subdomain.downcase }, if: :subdomain?

  validates :name, :type, presence: true, length: { maximum: 50 }
  with_options if: :root? do |root|
    root.validates :number, :country, :year, presence: true
    root.validates :account_manager, :project_manager, presence: true, on: :create
  end
  with_options if: :project? do |project|
    project.validates :number, presence: true
    project.validates :subdomain, presence: true, length: { maximum: 200 }, uniqueness: true
    project.validate :subdomain_format_validation
  end
  # disabled this validation as it was causing error while saving sub-campaign
  # TODO: Needs to be investigated
  # validate :relevant_reports, if: -> { report_ids.any? && end_level? }
  validate :allowed_data, if: -> { operator }

  before_validation :ensure_subdomain, if: :retail?
  before_create :set_hogan_group_name, if: :project?
  after_commit :set_tte, if: -> { parent_id.present? }, on: %i[create update]
  after_commit :set_end_level, if: -> { parent_id.present? }, on: %i[create update]

  # Type of client.
  # Retail - is client who bought some product
  enum type: %i[partner corporate distributer associate tte retail other]
  enum applicable_level: { project: 0, campaign: 1, sub_campaign: 2 }, _suffix: :level

  mount_uploader :logo, ImageUploader
  mount_uploader :background, ImageUploader

  scope :enabled, -> { where.not(disabled: true, archived: true) }
  scope :not_archived, -> { where.not(archived: true) }
  scope :tenancies, -> { roots }
  scope :not_retails, -> { where.has { type.not_eq(:retail) } }
  scope :by_report_family_assessment, lambda { |assessment|
                                        joins(:report_families).
                                          where(report_families: { id: assessment.report_family_ids })
                                      }
  scope :end_level, -> { where(end_level: true) }
  scope :projects_of, lambda { |client_id|
                        where(id: client_id).
                          take.descendants.at_depth(Client::HIERARCHY_LEVEL[:project])
                      }
  scope :campaigns_of, lambda { |client_id|
                         where(id: client_id).
                           take.descendants.at_depth(Client::HIERARCHY_LEVEL[:campaign])
                       }
  scope :sub_campaigns_of, lambda { |client_id|
                             where(id: client_id).
                               take.descendants.at_depth(Client::HIERARCHY_LEVEL[:sub_campaign])
                           }
  scope :campaigns_and_sub_campaigns_of, lambda { |client_id|
                                           Client.campaigns_of(client_id).
                                             or(Client.sub_campaigns_of(client_id))
                                         }
  scope :descendants_of_arr, ->(client_ids) { where('clients.ancestry ~ ?', "(/|^)(#{client_ids.join('|')})(/|$)") }
  scope :projects, -> { where(ancestry_depth: HIERARCHY_LEVEL[:project]) }
  scope :campaigns, -> { where(ancestry_depth: HIERARCHY_LEVEL[:campaign]) }
  scope :sub_campaigns, -> { where(ancestry_depth: HIERARCHY_LEVEL[:sub_campaign]) }

  def assign_by_membership_and_assessment(membership_id, assessment_id)
    memberships.find(membership_id).assigns.find_by(assessment_id: assessment_id)
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
  end

  def assessment_universal_links_enabled?(assessment_id)
    assessments_clients.find_by(assessment_id: assessment_id)&.enable_universal_links?
  end

  def has_assessment_key?(assessment_id)
    !!assessments_clients.find_by(assessment_id: assessment_id)&.assessment_key
  end

  private

  def generate_hogan_group_name
    "#{client.name} - #{project.subdomain}"
  end

  def generate_subdomain
    loop do
      subdomain = "retail_#{Random.rand(99_999)}#{Time.now.to_i}"
      break subdomain unless Client.exists?(subdomain: subdomain)
    end
  end

  def subdomain_format_validation
    return if subdomain =~ /^[a-zA-Z0-9\-_]+$/

    errors.add(:subdomain, 'Wrong subdomain format')
  end

  def set_tte
    update_column(:tte_id, root.id)
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
    if operator.is?(:project_admin)
      errors.add(:base) if root?
    end
  end
end
# rubocop:enable Metrics/ClassLength
