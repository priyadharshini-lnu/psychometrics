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

  scope :search_query, lambda { |query|
  }

  scope :sorted_by, lambda { |sort_key|
    # Sorts students by sort_key
  }

  def clone
    @cloned_dimension = self.dup
    @cloned_dimension.name = "#{@cloned_dimension.name} (#{I18n.t('administration.copy')})"
    @cloned_dimension
  end
end
