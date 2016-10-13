# == Schema Information
#
# Table name: clients
#
#  id                :integer          not null, primary key
#  name              :string
#  licenses          :integer          default(0)
#  licenses_used     :integer          default(0)
#  licenses_expire   :date
#  subdomain         :string
#  logo_file_name    :string
#  logo_content_type :string
#  logo_file_size    :integer
#  logo_updated_at   :datetime
#  design            :json
#  disabled          :boolean          default(FALSE)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class Client < ApplicationRecord
  include Copyable

  has_many :memberships
  has_many :users, through: :memberships
  has_and_belongs_to_many :assessments, join_table: :assessments_clients

  validates :name, presence: true, length: { maximum: 200 }, uniqueness: true

  store :design, accessors: [:background_color]

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

  def self.options_for_select
    all.map { |client| [client.decorate.display_name, client.id] }
  end
end
