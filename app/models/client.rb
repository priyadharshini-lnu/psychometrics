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
  has_many :admins, -> { where(role: ::User::USER_ROLES[:admin]) }, through: :memberships, source: :user, class_name: 'User'
  has_many :managers, -> { where(role: ::User::USER_ROLES[:manager]) }, through: :memberships, source: :user
  has_many :members, -> { where(role: ::User::USER_ROLES[:member]) }, through: :memberships, source: :user

  has_many :assessment_clients, dependent: :destroy
  has_many :assessments, through: :assessment_clients
  has_many :client_reports, dependent: :destroy
  has_many :reports, through: :client_reports

  has_one :retail_user, class_name: 'User'

  validates :subdomain, presence: true, length: { maximum: 200 }, uniqueness: true
  validates :name, :type, presence: true

  before_validation :ensure_subdomain, if: :retail?

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
    if column.in?(%w(id active name created_at updated_at licenses_used licenses_expire))
      order("clients.#{column} #{direction}")
    elsif column == 'active'
      order("clients.disabled #{direction}")
    end
  }

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

  private

  def generate_subdomain
    loop do
      subdomain = "retail_#{Random.rand(99_999)}#{Time.now.to_i}"
      break subdomain unless Client.exists?(subdomain: subdomain)
    end
  end
end
