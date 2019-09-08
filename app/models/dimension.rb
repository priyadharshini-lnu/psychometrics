# frozen_string_literal: true

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
#  owner_id      :integer
#

class Dimension < ApplicationRecord
  include Copyable

  belongs_to :owner, class_name: 'Client', foreign_key: :owner_id
  has_many :factors, -> { roots.order(id: :asc) }
  has_many :occupations
  has_many :sub_factors, -> { no_roots.order(id: :asc) }, class_name: 'Factor'
  has_many :all_factors, class_name: 'Factor'
  has_many :assessments
  has_many :norms
  has_many :innovation_styles

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true
  validates :owner, presence: true, allow_nil: true

  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  # Sorting
  scope :sorted_by, lambda { |sort_key|
    # extract the sort direction from the param value.
    direction = /desc$/.match?(sort_key) ? 'desc' : 'asc'
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

  def clone_and_save
    @cloned_dimension = deep_clone(include: [:occupations, { factors: :sub_factors }],
                                   except: [:factors_count, { factors: [:subfactors_count] }])
    @cloned_dimension.gen_uniq_name
    if @cloned_dimension.save
      # SubFactors have link to original dimension.
      Factor.where(parent_id: @cloned_dimension.factor_ids).update_all(dimension_id: @cloned_dimension.id)
      @cloned_dimension
    end
  end
end
