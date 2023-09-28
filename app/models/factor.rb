# frozen_string_literal: true

class Factor < ApplicationRecord
  include Copyable
  include RansackSearchableFields
  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  # has_ancestry ancestry_column: :parent_id
  belongs_to :dimension, touch: true
  has_many :factors_sub_factors, dependent: :destroy
  has_many :parent_factor_sub_factors, foreign_key: :sub_factor_id, class_name: 'FactorsSubFactor'
  has_many :sub_factors, through: :factors_sub_factors
  has_many :parent_factors, through: :parent_factor_sub_factors, source: :factor
  has_many :factors_norms, dependent: :destroy
  has_many :factors_scoring, dependent: :destroy
  has_many :questions, through: :factors_scoring
  has_many :occupations_factors, dependent: :destroy
  has_many :innovation_styles_factors, dependent: :destroy
  has_many :aliases, class_name: 'FactorsAlias', dependent: :destroy

  validates :name, :dimension, presence: true
  validates :name, length: { maximum: 100 }, allow_blank: true
  validates :code, length: { minimum: 3, maximum: 4 }, allow_blank: true
  # TODO: remove allow_blank?

  after_create :create_aliases
  after_update ::Callbacks::Models::Factors::UpdateAliases.new
  after_destroy ::Callbacks::Models::Factors::DestroyFactorSource.new

  enum scoring_strategy: {
    questions: 0,
    sub_factor_questions: 1,
    sub_factors_average: 2,
    sub_factors_conditional_average: 3,
    questions_sum: 4,
    sub_factor_questions_sum: 5,
    external_score: 6,
    questions_percentage: 7
  }, _suffix: :strategy

  mount_uploader :icon, Public::ImageUploader

  has_one_image_attachment :as_icon, variants: [:icon]
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :icon

  def attachment_storage_path(attribute_name, filename)
    "public/factor/#{attribute_name}/#{filename}"
  end

  accepts_nested_attributes_for :factors_sub_factors, allow_destroy: true

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

  scope :with_norm, lambda { |norm_id|
    joins(
      sanitize_sql_array(
        [
          'LEFT JOIN factors_norms ON factors_norms.factor_id = factors.id and factors_norms.norm_id = ?',
          norm_id
        ]
      )
    )
  }
  scope :roots, -> { where(parent_id: nil) }
  scope :no_roots, -> { where.not(parent_id: nil) }
  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
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
    @cloned_factor = deep_clone include: [:factors_sub_factors] do |original, kopy|
      kopy.icon = original.icon if original.is_a?(Factor)
    end
    @cloned_factor.gen_uniq_name
    @cloned_factor.save ? @cloned_factor : nil
  end

  def descendants
    Factor.where(id: descendant_ids)
  end

  # TODO: (atanych): optimize that if we wanna add deep child level
  def descendant_ids
    (sub_factor_ids + sub_factors.map(&:descendant_ids)).flatten
  end

  def ancestors
    Factor.where(id: ancestor_ids)
  end

  def ancestor_ids
    (parent_factor_ids + parent_factors.map(&:ancestor_ids)).flatten
  end

  def log_attribute_for_delete
    slice(:name, :dimension_id, :scoring_strategy)
  end

  private

  def create_aliases
    existing_reports = Report.joins(:assessments).distinct.where(assessments: { dimension_id: dimension.id })
    existing_reports.find_each do |report|
      FactorsAlias.create(report: report, factor: self)
    end
  end
end
