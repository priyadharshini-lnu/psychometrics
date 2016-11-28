# == Schema Information
#
# Table name: dimensions
#
#  id            :integer          not null, primary key
#  name          :string
#  disabled      :boolean          default(FALSE)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  factors_count :integer          default(0)
#

class Dimension < ApplicationRecord
  include Copyable

  has_many :factors, -> { roots.order(id: :asc) }
  has_many :occupations
  has_many :sub_factors, -> { no_roots.order(id: :asc) }, class_name: 'Factor'
  has_many :assessments
  has_many :norms

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

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
    case sort_key.to_s
    when /^id_/
      order("dimensions.id #{direction}")
    when /^active_/
      order("dimensions.disabled #{direction}")
    when /^name_/
      order("dimensions.name #{direction}")
    when /^factors_count_/
      order("dimensions.factors_count #{direction}")
    when /^created_at_/
      order("dimensions.created_at #{direction}")
    when /^updated_at_/
      order("dimensions.updated_at #{direction}")
    end
  }

  def clone
    @cloned_dimension = deep_clone(include: [{ factors: :sub_factors }],
                                   except: [:factors_count, { factors: [:subfactors_count] }])
    @cloned_dimension.gen_uniq_name
    @cloned_dimension
  end
end
