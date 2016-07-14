class Dimension < ApplicationRecord
  validates :name, presence: true
  validates :name, uniqueness: true

  filterrific(
      default_filter_params: {
          sorted_by: 'created_at_desc'
                              },
      available_filters:     [
                                 :search_query, :sorted_by
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
        order("dimensions.id #{direction}")
      when /^favourite_/
        order("dimensions.favourite #{direction}")
      when /^active_/
        order("dimensions.disabled #{direction}")
      when /^name_/
        order("dimensions.name #{direction}")
      when /^created_at_/
        order("dimensions.created_at #{direction}")
      when /^updated_at_/
        order("dimensions.updated_at #{direction}")
    end
  }

  def clone
    @cloned_dimension = self.dup
    @cloned_dimension.name = "#{@cloned_dimension.name} (#{I18n.t('administration.copy')})"
    @cloned_dimension
  end
end
