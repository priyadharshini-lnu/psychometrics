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
#  users_count        :integer          default(0)
#  archived           :boolean          default(FALSE)
#  tte_id             :integer
#  created_by_id      :integer
#  modified_by_id     :integer
#  ancestry           :string
#  ancestry_depth     :integer          default(0)
#

class Client < ApplicationRecord
  include Copyable

  HIERARCHY_LEVEL = {
      project: 1,
      campaign: 2,
      sub_campaign: 3
  }.freeze

  has_ancestry cache_depth: true
  store :design, accessors: [:background_color]

  # Disables single column inheritance
  self.inheritance_column = :_type_disabled

  belongs_to :tte, class_name: 'Client'
  belongs_to :account_manager, class_name: 'User'
  belongs_to :project_manager, class_name: 'User'
  belongs_to :creator, foreign_key: :created_by_id, class_name: 'User'
  belongs_to :modifier, foreign_key: :modified_by_id, class_name: 'User'

  # Users and Memberships
  has_one :retail_user, class_name: 'User'
  has_many :memberships # on delete cascade
  has_many :users, through: :memberships
  has_many :admins, through: :admin_memberships, source: :user, class_name: 'User'
  has_many :admin_memberships, -> { where(memberships: { role: Membership::ADMIN_ROLE }) }, source: :membership, class_name: 'Membership'
  has_many :assigned_memberships, -> { assigned }, source: :membership, class_name: 'Membership'
  has_many :completed_memberships, -> { completed }, source: :membership, class_name: 'Membership'
  has_many :managers, -> { where(memberships: { role: Membership::MANAGER_ROLE }) }, through: :memberships, source: :user
  has_many :members, -> { where(memberships: { role: Membership::MEMBER_ROLE }) }, through: :memberships, source: :user
  has_many :projects_admins, -> { where(memberships: { role: Membership::ADMIN_ROLE }) }, through: :projects, source: :users

  # Reports
  has_many :clients_reports # on delete cascade
  has_many :reports, through: :clients_reports
  has_many :own_reports, class_name: 'Report', foreign_key: :owner_id
  has_many :available_reports, through: :report_families, source: :reports
  has_and_belongs_to_many :report_families, join_table: :clients_report_families, class_name: 'ReportFamily'

  # Self association
  has_many :projects, -> { where(ancestry_depth: HIERARCHY_LEVEL[:project]) }, foreign_key: :tte_id, class_name: 'Client'
  has_many :campaigns, -> { where(ancestry_depth: HIERARCHY_LEVEL[:campaign]) }, foreign_key: :tte_id, class_name: 'Client'
  has_many :sub_campaigns, -> { where(ancestry_depth: HIERARCHY_LEVEL[:sub_campaign]) }, foreign_key: :tte_id, class_name: 'Client'

  has_many :norms
  has_many :dimensions
  has_many :assign_clients, dependent: :destroy
  has_many :assessments, -> { group(:id) }, through: :reports
  has_many :license_usages
  has_many :licenses, inverse_of: :client, dependent: :destroy
  accepts_nested_attributes_for :licenses, allow_destroy: true

  validates :name, :type, presence: true
  with_options if: :root? do |root|
    root.validates :number, :country, :year, presence: true
    root.validates :account_manager, :project_manager, :report_families, presence: true, on: :create
  end
  with_options if: :project? do |project|
    project.validates :number, presence: true
    project.validates :reports, presence: true, on: :create
    project.validates :subdomain, presence: true, length: { maximum: 200 }, uniqueness: true
    project.validate :subdomain_format_validation
  end
  before_validation :ensure_subdomain, if: :retail?
  before_update :sync_archived_with_descendants, if: -> { defined?(:archived_changed?) && :archived_changed? }
  after_commit :set_tte, if: 'parent_id.present?', on: [:create, :update]
  after_commit :set_end_level, if: 'parent_id.present?', on: [:create, :update]

  # Type of client.
  # Retail - is client who bought some product
  enum type: [:partner, :corporate, :distributer, :associate, :tte, :retail, :other]
  enum applicable_level: [:project, :campaign, :sub_campaign], _suffix: :level

  mount_uploader :logo, ImageUploader
  mount_uploader :background, ImageUploader

  scope :enabled, -> { where.not(disabled: true, archived: true) }
  scope :not_archived, -> { where.not(archived: true) }
  scope :tenancies, -> { roots }
  scope :not_retails, -> { where.has { type.not_eq(:retail) } }
  scope :by_report_family_assessment, -> (assessment) { joins(:report_families).where(report_families: { id: assessment.report_family_ids }) }
  scope :end_level, -> { where(end_level: true) }
  scope :projects_of, -> (client_id) { where(id: client_id).take.descendants.at_depth(Client::HIERARCHY_LEVEL[:project]) }
  scope :campaigns_of, -> (client_id) { where(id: client_id).take.descendants.at_depth(Client::HIERARCHY_LEVEL[:campaign]) }
  scope :sub_campaigns_of, -> (client_id) { where(id: client_id).take.descendants.at_depth(Client::HIERARCHY_LEVEL[:sub_campaign]) }

  def clone
    @cloned_item = deep_clone do |_original, copy|
      copy.gen_uniq_name
      copy.subdomain = copy.name.gsub(/[^0-9A-Za-z]/, '').parameterize
      copy.users_count = 0
    end
  end

  def self.options_for_select
    all.map { |client| [client.decorate.display_name, client.id] }
  end

  def ensure_subdomain
    self.subdomain = generate_subdomain if subdomain.blank?
  end

  def child?
    self.ancestry.present?
  end

  def tenancy?
    root?
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

  def get_type
    return 'Client' if tenancy?
    return 'Project' if project?
    return 'Campaign' if campaign?
    return 'Sub Campaign' if sub_campaign?
  end

  def allowed_data?(user)
    return admin_allowed_data? if user.is?(:admin)
    true
  end

  private

  # If we arvhive client
  #   Then we archive all descendants
  def sync_archived_with_descendants
    descendants.update_all(archived: archived) if defined?(archived)
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

  def admin_allowed_data?
    !root?
  end
end
