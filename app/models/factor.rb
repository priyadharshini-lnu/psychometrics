class Factor < ApplicationRecord
  include Copyable
  has_ancestry ancestry_column: :parent_id
  belongs_to :dimension
  belongs_to :parent, class_name: 'Factor', counter_cache: :subfactors_count
  has_many :sub_factors, foreign_key: :parent_id, class_name: 'Factor'

  validates :name, :dimension, presence: true
  validates :name, length: { maximum: 100 }, allow_blank: true
  validates :name, uniqueness: true

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
      order("factors.id #{direction}")
    when /^name_/
      order("factors.name #{direction}")
    when /^subfactors_count_/
      order("factors.subfactors_count #{direction}")
    when /^questions_count_/
      order("factors.questions_count #{direction}")
    when /^created_at_/
      order("factors.created_at #{direction}")
    when /^updated_at_/
      order("factors.updated_at #{direction}")
    end
  }

  # Search entity by word
  scope :with_dimension, lambda { |dimension_id|
    where(dimension_id: dimension_id)
  }
end
