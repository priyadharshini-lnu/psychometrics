# == Schema Information
#
# Table name: factors
#
#  id               :integer          not null, primary key
#  name             :string
#  subfactors_count :integer          default(0)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  dimension_id     :integer
#  parent_id        :string
#  disabled         :boolean          default(FALSE)
#

class Factor < ApplicationRecord
  include Copyable
  # has_ancestry ancestry_column: :parent_id
  belongs_to :dimension
  belongs_to :parent, class_name: 'Factor', counter_cache: :subfactors_count
  has_many :sub_factors, foreign_key: :parent_id, class_name: 'Factor', dependent: :destroy
  has_many :factors_norms
  has_many :factors_scoring
  has_many :occupations_factors, dependent: :destroy
  before_create :increment_factors
  before_destroy :decrement_factors
  validates :name, :dimension, presence: true
  validates :name, length: { maximum: 100 }, allow_blank: true

  # For deep clone from dimension
  before_validation :set_dimension_id, if: proc { dimension_id.nil? && parent }
  mount_uploader :icon, ImageUploader

  # norm types constant
  NORM_TYPES = %w(eti yti).freeze
  # factor types constant
  FACTOR_TYPES = %w(factors sub_factors).freeze

  filterrific(
    default_filter_params: {
      sorted_by: 'created_at_desc'
    },
    available_filters: [
      :sorted_by,
      :search_query,
      :with_factor_type,
      :with_norm_type
    ]
  )

  scope :with_factor_type, lambda { |type|
    type = type.to_s
    raise "supported types: #{FACTOR_TYPES}" unless FACTOR_TYPES.include? type
    result = where(parent_id: nil) if type == 'factors'
    result = where.not(parent_id: nil) if type == 'sub_factors'
    result
  }

  scope :with_norm_type, lambda { |type, norm_id|
    joins("LEFT JOIN factors_norms as factors_norms on factors_norms.factor_id = factors.id
            and factors_norms.type = '#{type}'
            and factors_norms.norm_id = '#{norm_id}'")
  }
  scope :roots, -> { where(parent_id: nil) }
  scope :no_roots, -> { where.not(parent_id: nil) }
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
      order("factors.id #{direction}")
    when /^name_/
      order("factors.name #{direction}")
    when /^subfactors_count_/
      order("factors.subfactors_count #{direction}")
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

  #
  # Returns hash: ass_name
  #
  def questions_count_by_assessment
    FactorsScoring.where(factor_id: id).where('json_array_length(props) > 0').group(:assessment_id).count
  end

  private

  def increment_factors
    dimension.increment!(:factors_count) if parent_id.nil?
  end

  def decrement_factors
    dimension.decrement!(:factors_count) if parent_id.nil?
  end
end
