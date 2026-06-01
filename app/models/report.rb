# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class Report < ApplicationRecord
  audited

  include Copyable
  include RansackSearchableFields
  include SoftDelete
  include OwnerValidations
  include ActiveStorageAttachable
  include Taggable

  PROVIDERS = {
    internal: 0,
    hogan: 2,
    saville: 3,
    pearson: 4,
    custom_upload: 5,
    mettl: 6,
    skillvue: 7,
    yoodli: 8,
    mhs: 9,
    microsite: 10
  }.freeze

  MAX_ASSESSMENT_COUNT = 10
  MIN_ASSESSMENT_COUNT = 1

  self.inheritance_column = :_type_disabled

  # ASSOCIATIONS
  #
  belongs_to :assessment
  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'
  belongs_to :owner, class_name: 'Client'
  has_many :report_families_reports, dependent: :destroy
  has_many :report_families, through: :report_families_reports, source: :report_family
  has_many :pages, class_name: 'Reports::Page', dependent: :destroy
  has_many :modules, through: :pages, dependent: :destroy
  has_many :filters, class_name: 'Reports::Filter', dependent: :destroy
  has_many :campaign_factors, class_name: 'Reports::CampaignFactor', dependent: :destroy
  has_many :campaign_ai_artifacts, class_name: 'Reports::CampaignAIArtifact', dependent: :destroy
  has_many :translations, as: :resource, dependent: :destroy
  has_many :user_reports, dependent: :restrict_with_error
  has_many :campaign_reports, dependent: :restrict_with_error
  has_many :assessments_reports, dependent: :destroy
  has_many :assessments, -> { order(:name) }, through: :assessments_reports,
                                              before_add: :add_factors_aliases,
                                              before_remove: :remove_factor_aliases
  has_many :assessments_default_order, through: :assessments_reports, source: :assessment
  has_many :dimensions, -> { distinct }, through: :assessments_default_order
  has_many :report_approval_settings, dependent: :destroy
  has_many :report_approvals, dependent: :destroy

  scope :dimensions_with_occupations, -> { includes(dimensions: [:occupations]) } do
    def with_occupations_since(timestamp)
      where('occupations.updated_at >= ?', timestamp)
    end
  end

  scope :dimensions_with_factors, -> { eager_load(dimensions: [:factors]) } do
    def filter_by(factor_ids)
      where('factors.id' => factor_ids)
    end

    def with_factors_since(timestamp)
      where('factors.updated_at >= ?', timestamp)
    end
  end

  scope :assignable, -> { where(disabled: false, archived: false) }
  scope :campaign_factor_dependable, -> { joins(:campaign_factors) }
  scope :campaign_ai_artifact_dependable, -> { joins(:campaign_ai_artifacts) }

  has_many :factors_aliases, dependent: :destroy
  has_many :factors_through_factors_aliases, through: :factors_aliases, source: :factor
  has_many :campaign_templates, dependent: :destroy

  has_one :hogan_report_setting, dependent: :destroy
  has_one :saville_report_setting, dependent: :destroy

  tenant_config has_global_records: true, optional: true
  include Tenantable

  #   VALIDATIONS
  #
  validates :assessment, presence: true, unless: :assessment_not_applicable?
  validates :owner, presence: true, allow_nil: true
  validate :max_assessments_count
  validate :min_assessments_count, unless: :assessment_not_applicable?
  validates :external_settings, presence: true, if: :provider_hogan? || :provider_saville? || :provider_mhs?
  validate :all_assessments_mhs, if: :provider_mhs?
  validate :all_assessments_hogan, if: :provider_hogan?
  validate :all_assessments_saville, if: :provider_saville?
  validate :all_assessments_mhs, if: :provider_mhs?

  #   CALLBACKS
  #
  before_validation :set_assessment, unless: :assessment_not_applicable?
  before_create :create_default_styles
  after_create ::Callbacks::Models::Reports::CreateFactorsAliases.new
  after_save :delete_assessments_reports, if: :assessment_not_applicable?

  enum :category, { common: 0, threesixty: 1 }, prefix: :category
  enum :provider, PROVIDERS, prefix: :provider
  store :extra, accessors: [:icon_color], coder: JsonSerializer

  serialize :external_settings, coder: PsyJsonbSerializer

  has_one_image_attachment :icon, variants: [:thumb]
  has_one_image_attachment :poster, variants: [:thumb]

  acts_as_taggable_on :tags
  acts_as_taggable_tenant :owner_id

  ransacker :category, formatter: proc { |v| categories[v] } do |parent|
    parent.table[:category]
  end

  def attachment_storage_path(attribute_name, filename)
    "public/report/#{id}/#{attribute_name}/#{filename}"
  end

  def delete_assessments_reports
    assessments_reports.destroy_all
  end

  def set_default_color
    self.icon_color = Settings.default_colors.sample
  end

  #   SCOPES
  #
  scope :enabled, -> { where.not(disabled: true) }
  scope :disabled, -> { where(disabled: true) }
  scope :with_owner, ->(owner_id) { where(owner_id: owner_id) }
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
    joins(:assessments).
      where(assessments: { access_reports_at: nil }).
      or(joins(:assessments).where('assessments.access_reports_at <= ?', Time.zone.now))
  }
  scope :multiple, -> { joins(:assessments).group('reports.id').having('COUNT(assessments) > 1') }
  scope :single, -> { joins(:assessments).group('reports.id').having('COUNT(assessments) = 1') }
  scope :not_external, -> { where(provider: :internal) }
  scope :archived, -> { where(archived: true) }
  scope :unarchived, -> { where(archived: false) }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name provider category]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[assessments]
  end

  def assessment_not_applicable?
    data_only? || provider_custom_upload?
  end

  def modules_empty?
    !modules.exists?
  end

  # Copy report with nested resources
  def clone
    @cloned_item = deep_clone(
      include: %i[assessments]
    )
    @cloned_item.copy_and_upload(icon, :icon) if icon.attached?
    @cloned_item.copy_and_upload(poster, :poster) if poster.attached?
    @cloned_item.gen_uniq_name
    @cloned_item
  end

  # Returns true if Report is external
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
    provider_hogan?
  end

  def external_report_id
    external_settings[:report_id]
  end

  def should_have_external_settings?
    provider_hogan? || provider_saville?
  end

  def has_data_configuration_occupations?
    return false if data_configuration.blank?

    data_configuration['sections'].each do |section|
      return true if section['data'].find { |d| d['type'] == 'ranked_occupations' }
    end

    false
  end

  def data_configuration_factor_ids
    data_configuration['sections'].map do |section|
      section['data'].map do |d|
        d['factorId'] if %w[normed_factor raw_factor].include? d['type']
      end
    end.flatten.compact
  end

  def data_configuration_assessment_ids
    JsonPath.new('$..assessmentId').on(data_configuration).uniq
  end

  def pdf_dimension
    height = props&.dig('sizes', 'height') || 1100
    width = props&.dig('sizes', 'width') || 850
    page_height_increment = 0
    page_width_increment = 0
    page_height_increment = 1 if [827].include?(height)
    page_width_increment = -1 if [1169, 1100].include?(height)
    {
      width: "#{width + page_width_increment}px",
      height: "#{height + page_height_increment}px"
    }
  end

  def log_attribute_for_delete
    slice(:name, :owner_id)
  end

  def external_settings?
    provider_hogan? || provider_saville?
  end

  def self.ransackable_scopes(_)
    %i[filterable_fields with_resource_state]
  end

  def add_all_factor_aliases
    assessments.map do |assessment|
      add_factors_aliases(assessment)
    end
  end

  private

  def create_default_styles
    Settings.default_styles.each do |style|
      styles[style.id] = style.to_h
    end
  end

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
    self.assessment = assessments.min_by(&:name)
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

  def all_assessments_saville
    errors.add(:base, :assessments_not_saville) unless assessments.all?(&:saville?)
  end

  def all_assessments_mhs
    errors.add(:base, I18n.t('admin.assessments_not_mhs')) unless assessments.all?(&:mhs?)
  end
end
# rubocop:enable all
