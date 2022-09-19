# frozen_string_literal: true

class Dimension < ApplicationRecord
  include Copyable
  include RansackSearchableFields
  include OwnerValidations

  belongs_to :owner, class_name: 'Client'
  has_many :factors, -> { roots.order(id: :asc) }
  has_many :occupations
  has_many :all_factors, class_name: 'Factor'
  has_many :assessments
  has_many :norms
  has_many :innovation_styles

  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'

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

  def log_attribute_for_delete
    slice(:owner_id, :name)
  end

  def clone_and_save
    @cloned_dimension = deep_clone(
      include: [
        { all_factors: :factors_sub_factors },
        { occupations: { occupations_factors: :factor } },
        { innovation_styles: { innovation_styles_factors: :factor } }
      ],
      except: [:factors_count],
      use_dictionary: true
    ) do |original, copied|
      original.class.uploaders.each_key do |image_column|
        copied.public_send("#{image_column}=", original.public_send(image_column))
      end
    end

    @cloned_dimension.gen_uniq_name
    if @cloned_dimension.save
      # SubFactors have link to original dimension.
      Factor.where(parent_id: @cloned_dimension.factor_ids).update_all(dimension_id: @cloned_dimension.id)
      @cloned_dimension
    end
  end
end
