# == Schema Information
#
# Table name: clients
#
#  id              :integer          not null, primary key
#  name            :string
#  licenses        :integer          default(0)
#  licenses_used   :integer          default(0)
#  licenses_expire :date
#  subdomain       :string
#  logo            :string
#  design          :json
#  disabled        :boolean          default(FALSE)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  background      :string
#  type            :integer          default("enterprise")
#

class Client < ApplicationRecord
  include Copyable

  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :admins, through: :admin_memberships, source: :user, class_name: 'User'
  has_many :admin_memberships, -> { where(memberships: { role: Membership::ADMIN_ROLE }) }, source: :membership, class_name: 'Membership'
  has_many :managers, -> { where(memberships: { role: Membership::MANAGER_ROLE }) }, through: :memberships, source: :user
  has_many :members, -> { where(memberships: { role: Membership::MEMBER_ROLE }) }, through: :memberships, source: :user

  has_many :assign_clients, dependent: :destroy
  # has_many :assessments, through: :assign_clients
  # has_many :reports, through: :assign_clients
  has_many :clients_reports, dependent: :destroy
  has_many :reports, through: :clients_reports
  has_many :assessments, -> { group(:id) }, through: :reports

  has_many :norms
  has_many :dimensions
  has_many :projects, class_name: 'Client', foreign_key: :parent_id

  has_many :licenses, inverse_of: :client, dependent: :destroy
  accepts_nested_attributes_for :licenses, allow_destroy: true
  has_many :license_usages

  has_one :retail_user, class_name: 'User'
  belongs_to :parent, class_name: 'Client'

  has_and_belongs_to_many :report_families, join_table: :clients_report_families, class_name: 'ReportFamily'
  has_many :available_reports, through: :report_families, source: :reports

  belongs_to :account_manager, class_name: 'User'
  belongs_to :project_manager, class_name: 'User'

  validates :subdomain, presence: true, length: { maximum: 200 }, uniqueness: true, if: :project?
  validates :name, :type, presence: true
  validate :subdomain_format_validation, if: :project?

  before_validation :ensure_subdomain, if: :retail?
  before_update :sync_archived_with_descendants, if: -> { defined?(:archived_changed?) && :archived_changed? }

  acts_as_nested_set counter_cache: :children_count

  store :design, accessors: [:background_color]

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  # Type of client.
  # Retail - is client who bought some product
  enum type: [:partner, :corporate, :distributer, :associate, :tte, :retail, :other]
  enum applicable_level: [:project, :campaign, :sub_campaign], _suffix: :level

  mount_uploader :logo, ImageUploader
  mount_uploader :background, ImageUploader

  scope :enabled, -> { where.not(disabled: true, archived: true) }
  scope :not_archived, -> { where.not(archived: true) }
  scope :tenancies, -> { roots }
  scope :projects, -> { roots }
  scope :not_retails, -> { where.has { type.not_eq(:retail) } }

  def clone
    @cloned_item = deep_clone do |_original, kopy|
      kopy.gen_uniq_name
      kopy.subdomain = kopy.name.gsub(/[^0-9A-Za-z]/, '').parameterize
    end
    @cloned_item
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

  def project?
    level == 1
  end

  def campaign?
    level == 2
  end

  def sub_campaign?
    level == 3
  end

  def subtenancy?
    campaign? || sub_campaign?
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
end
