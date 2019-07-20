# == Schema Information
#
# Table name: reports
#
#  id            :integer          not null, primary key
#  assessment_id :integer
#  name          :string
#  disabled      :boolean          default(FALSE)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  type          :integer          default("common")
#  owner_id      :integer
#

class Report < ApplicationRecord
  include Copyable

  TYPES = [
    COMMON_TYPE = 'common'.freeze,
    YTI_TYPE = 'yti'.freeze,
    ETI_TYPE = 'eti'.freeze
  ].freeze

  PROVIDERS = {
    internal: 0,
    mindmill: 1,
    hogan: 2
  }.freeze

  MAX_ASSESSMENT_COUNT = 10
  MIN_ASSESSMENT_COUNT = 1

  self.inheritance_column = :_type_disabled

  # ASSOCIATIONS
  #
  belongs_to :assessment
  belongs_to :owner, class_name: 'Client', foreign_key: :owner_id
  has_and_belongs_to_many :report_families

  has_many :pages, class_name: 'Reports::Page', dependent: :destroy
  has_many :filters, class_name: 'Reports::Filter', dependent: :destroy
  has_many :clients_reports # on delete cascade
  has_many :clients, through: :clients_reports
  has_many :translations, as: :resource
  has_many :product_reports, dependent: :destroy
  has_many :products, through: :product_reports
  has_many :assigns_reports # on delete restrict
  has_many :assessments_reports
  has_many :assessments, -> { order(:name) }, through: :assessments_reports, dependent: :destroy,
                                              before_add: :add_factors_aliases,
                                              before_remove: :remove_factor_aliases
  has_many :assessments_default_order, through: :assessments_reports, source: :assessment
  has_many :dimensions, -> { distinct }, through: :assessments_default_order
  has_many :factors_aliases, dependent: :destroy
  has_many :factors_through_factors_aliases, through: :factors_aliases, source: :factor

  has_one :hogan_report_setting
  accepts_nested_attributes_for :hogan_report_setting, allow_destroy: true

  #   VALIDATIONS
  #
  validates :assessment, presence: true
  validates :owner, presence: true, allow_nil: true
  validate :max_assessments_count
  validate :min_assessments_count
  validate :all_assessments_hogan, if: :hogan_report_setting

  #   CALLBACKS
  #
  before_validation :set_assessment
  before_save :delete_hogan_report_setting, :set_provider
  after_create ::Callbacks::Models::Reports::CreateFactorsAliases.new

  enum type: TYPES
  enum provider: PROVIDERS, _prefix: :provider
  store :extra, accessors: [:icon_color], coder: JsonSerializer

  mount_uploader :icon, ImageUploader

  def set_default_color
    self.icon_color = Settings.default_colors.sample
  end

  #   SCOPES
  #
  scope :enabled, -> { where.not(disabled: true) }
  scope :disabled, -> { where(disabled: true) }
  scope :with_owner, -> (owner_id) { where(owner_id: owner_id) }
  scope :with_report_families, lambda { |report_family_ids|
    report_family_ids.blank? ? none : joins(:report_families).where(report_families: { id: report_family_ids })
  }
  # Search entity by assessment category
  scope :with_assessment_category, lambda { |assessment_category|
    assessment_category == 'all' ? all : joins(:assessments).where(assessments: { category: assessment_category })
  }
  # Search entity by assessment
  scope :with_assessment, lambda { |assessment_id|
    joins(:assessments_reports).where(assessments_reports: { assessment_id: assessment_id })
  }
  scope :available_to_view, lambda {
    joins(:assessments).where.has { assessments.access_reports_at.eq(nil) | (assessments.access_reports_at <= Time.now) }
  }
  scope :for_clients, lambda { |client_ids|
    joins(:clients_reports).where.has { clients_reports.client_id.in(client_ids) }
  }
  scope :multiple, -> { joins(:assessments).group('reports.id').having('COUNT(assessments) > 1') }
  scope :single, -> { joins(:assessments).group('reports.id').having('COUNT(assessments) = 1') }
  scope :yti_eti, -> { where(type: [YTI_TYPE, ETI_TYPE]) }
  scope :not_external, -> { where(provider: :internal) }

  # Copy report with nested resources
  #
  def clone
    @cloned_item = deep_clone include: [:assessments, :report_families, { pages: :modules }, :hogan_report_setting]
    @cloned_item.gen_uniq_name
    @cloned_item
  end

  def yti_eti?
    [Report::YTI_TYPE, Report::ETI_TYPE].include? type
  end

  # Returns true if Report is external pdf from mindmill or hogan
  #
  def external_report?
    !provider_internal?
  end

  # Returns true if Report has 2 or more assessments
  #
  def multiple?
    !single?
  end

  # Returns true if Report has only 1 assessment
  #
  def single?
    assessments.size == 1
  end

  # Returns true if Report has 2 or more assessments with provided Dimension ID
  #
  def single_dimension?(dimension_id)
    assessments.pluck(:dimension_id).count(dimension_id) == 1
  end

  def destroy_dimension_aliases(dimension)
    FactorsAlias.where(report: self, factor_id: dimension.all_factor_ids).destroy_all
  end

  def flat_data_configuration
    (data_configuration['sections'] || []).flat_map { |section| section['data'] || [] }
  end

  def hogan?
    hogan_report_setting.present?
  end

  private

  def max_assessments_count
    return if assessments.size <= MAX_ASSESSMENT_COUNT
    errors.add(:assessments,
               I18n.t('activerecord.errors.models.report.max_assessment_count', max: MAX_ASSESSMENT_COUNT))
  end

  def min_assessments_count
    return if assessments.size >= MIN_ASSESSMENT_COUNT
    errors.add(:assessments,
               I18n.t('activerecord.errors.models.report.min_assessment_count', min: MIN_ASSESSMENT_COUNT))
  end

  def set_assessment
    self.assessment = assessments.sort_by(&:name)&.first
  end

  def delete_hogan_report_setting
    if hogan_report_setting && !assessment.hogan?
      hogan_report_setting.destroy
    end
  end

  def add_factors_aliases(assessment)
    return if assessment.external? || new_record?
    assessment.dimension.all_factors.each { |factor| factor.aliases.find_or_create_by(report: self) }
  end

  def remove_factor_aliases(assessment)
    return if assessment.external? || !single_dimension?(assessment.dimension_id)
    destroy_dimension_aliases(assessment.dimension)
  end

  def all_assessments_hogan
    errors.add(:base, :assessments_not_hogan) unless assessments.all?(&:hogan?)
  end

  def set_provider
    if hogan?
      self.provider = PROVIDERS[:hogan]
    elsif mindmill?
      self.provider = PROVIDERS[:mindmill]
    else
      self.provider = PROVIDERS[:internal]
    end
  end
end
