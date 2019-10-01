# frozen_string_literal: true

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
#  parent_id        :integer
#  disabled         :boolean          default(FALSE)
#  icon             :string
#  description      :text
#

class Factor < ApplicationRecord
  include Copyable
  # has_ancestry ancestry_column: :parent_id
  belongs_to :dimension, touch: true
  has_many :factors_sub_factors
  has_many :sub_factors, through: :factors_sub_factors
  has_many :factors_norms
  has_many :factors_scoring
  has_many :questions, through: :factors_scoring
  has_many :occupations_factors, dependent: :destroy
  has_many :innovation_styles_factors, dependent: :destroy
  has_many :aliases, class_name: 'FactorsAlias', dependent: :destroy

  validates :name, :dimension, presence: true
  validates :name, length: { maximum: 100 }, allow_blank: true

  before_create :increment_factors
  before_destroy :decrement_factors
  after_update ::Callbacks::Models::Factors::UpdateAliases.new
  after_create :create_aliases
  after_destroy ::Callbacks::Models::Factors::DestroyFactorSource.new

  enum scoring_strategy: %i[questions sub_factor_questions sub_factors_average]

  mount_uploader :icon, ImageUploader

  accepts_nested_attributes_for :factors_sub_factors, allow_destroy: true

  # norm types constant
  NORM_TYPES = %w[eti yti].freeze
  # factor types constant
  FACTOR_TYPES = %w[factors sub_factors].freeze

  scope :active, -> { where(disabled: false) }
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
    direction = /desc$/.match?(sort_key) ? 'desc' : 'asc'
    case sort_key.to_s
      when /^id_/
        order("factors.id #{direction}")
      when /^name_/
        order("factors.name #{direction}")
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

  def clone_and_save
    @cloned_factor = deep_clone(include: [:factors_sub_factors])
    @cloned_factor.gen_uniq_name
    @cloned_factor.save ? @cloned_factor : nil
  end

  private

  def increment_factors
    dimension.increment!(:factors_count) if parent_id.nil?
  end

  def decrement_factors
    dimension.decrement!(:factors_count) if parent_id.nil?
  end

  def create_aliases
    existing_reports = Report.joins(:assessments).distinct.where(assessments: { dimension_id: dimension.id })
    existing_reports.find_each do |report|
      FactorsAlias.create(report: report, factor: self)
    end
  end
end
