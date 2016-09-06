# == Schema Information
#
# Table name: norms
#
#  id         :integer          not null, primary key
#  name       :string
#  disabled   :boolean          default(FALSE)
#  created_by :integer
#  updated_by :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Norm < ApplicationRecord
  include Copyable
  belongs_to :creator, class_name: 'User', foreign_key: :created_by
  belongs_to :updater, class_name: 'User', foreign_key: :updated_by
  has_many :factors_norms
  belongs_to :dimension

  validates :name, :dimension, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  filterrific(
    default_filter_params: {
      sorted_by: 'created_at_desc'
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
    direction = (sort_key =~ /desc$/) ? 'desc' : 'asc'
    case sort_key.to_s
    when /^id_/
      order("norms.id #{direction}")
    when /^active_/
      order("norms.disabled #{direction}")
    when /^name_/
      order("norms.name #{direction}")
    when /^dimension_id_/
      includes(:dimension).order("dimensions.name #{direction}")
    when /^updated_by_/
      order("norms.updated_by #{direction}")
    when /^created_at_/
      order("norms.created_at #{direction}")
    when /^updated_at_/
      order("norms.updated_at #{direction}")
    end
  }
end
