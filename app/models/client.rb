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
  has_many :admins, -> { where(memberships: { role: Membership::ADMIN_ROLE }) }, through: :memberships, source: :user, class_name: 'User'
  has_many :managers, -> { where(memberships: { role: Membership::MANAGER_ROLE }) }, through: :memberships, source: :user
  has_many :members, -> { where(memberships: { role: Membership::MEMBER_ROLE }) }, through: :memberships, source: :user

  has_many :assign_clients, dependent: :destroy
  has_many :assessments, through: :assign_clients
  has_many :reports, through: :assign_clients
  has_many :norms
  has_many :dimensions
  has_many :projects, class_name: 'Client', foreign_key: :parent_id

  has_many :licenses, inverse_of: :client, dependent: :destroy
  accepts_nested_attributes_for :licenses, allow_destroy: true
  has_many :license_usages, as: :licenseable

  has_one :retail_user, class_name: 'User'
  belongs_to :parent, class_name: 'Client'

  validates :subdomain, presence: true, length: { maximum: 200 }, uniqueness: true, if: :project?
  validates :name, :type, presence: true
  validate :subdomain_format_validation, if: :project?
  # validate :license_expire_validation

  before_validation :ensure_subdomain, if: :retail?

  # before_create :use_license
  # before_update :use_license_design, if: :design_changed?
  acts_as_nested_set

  store :design, accessors: [:background_color]

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  # Type of client.
  # Retail - is client who bought some product
  enum type: [:enterprise, :retail]

  mount_uploader :logo, ImageUploader
  mount_uploader :background, ImageUploader

  filterrific(
    default_filter_params: {
      sorted_by: 'id_desc'
    },
    available_filters: [
      :sorted_by,
      :search_query
    ]
  )

  scope :enabled, -> { where.not(disabled: true) }

  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  # Sorting
  scope :sorted_by, lambda { |sort_key|
    # extract the sort direction from the param value.
    direction = sort_key =~ /desc$/ ? 'desc' : 'asc'
    column = sort_key.gsub("_#{direction}", '')
    if column.in?(%w(id active name created_at updated_at licenses_expire))
      order("clients.#{column} #{direction}")
    elsif column == 'active'
      order("clients.disabled #{direction}")
    end
  }

  scope :tenancies, -> { where(parent_id: nil) }

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
    parent_id.nil?
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

  def license_expire_validation
    errors.add(:licenses_final_expire, :invalid) if licenses_final_expire&.<= licenses_expire
  end

  def use_license
    Licenses::SubTenancies.use(self)
  end

  def use_license_design
    Licenses::TenancyBranding.use(self)
  end
end
