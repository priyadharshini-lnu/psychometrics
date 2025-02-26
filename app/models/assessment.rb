# frozen_string_literal: true

class Assessment < ApplicationRecord # rubocop:disable Metrics/ClassLength
  audited
  extend Mobility

  include Copyable
  include RansackSearchableFields
  include SoftDelete
  include OwnerValidations
  include ActiveStorageAttachable
  include Taggable

  PSYCHOMETRIC = 'psychometric'
  ORGANISATIONAL = 'organisational'
  CASE_STUDY = 'case_study'
  THREESIXTY = 'threesixty'
  ASSESSOR_FORM = 'assessor_form'
  LEAD_ASSESSOR_FORM = 'lead_assessor_form'
  HOGAN = 'hogan'
  AGILE = 'agile'
  SAVILLE = 'saville'
  PEARSON = 'pearson'
  IIHT = 'iiht'
  METTL = 'mettl'
  MEETING = 'meeting'
  SIMULATION = 'simulation'

  CATEGORIES_TYPES = [
    PSYCHOMETRIC,
    ORGANISATIONAL,
    CASE_STUDY,
    THREESIXTY,
    ASSESSOR_FORM,
    LEAD_ASSESSOR_FORM,
    HOGAN,
    AGILE,
    SAVILLE,
    PEARSON,
    IIHT,
    MEETING
  ].freeze

  COMMON_CATEGORIES_TYPES = [
    PSYCHOMETRIC,
    ORGANISATIONAL,
    CASE_STUDY,
    THREESIXTY,
    ASSESSOR_FORM,
    LEAD_ASSESSOR_FORM,
    AGILE,
    MEETING
  ].freeze

  CATEGORIES = {
    psychometric: PSYCHOMETRIC,
    organisational: ORGANISATIONAL,
    case_study: CASE_STUDY,
    threesixty: THREESIXTY,
    hogan: HOGAN,
    agile: AGILE,
    assessor_form: ASSESSOR_FORM,
    lead_assessor_form: LEAD_ASSESSOR_FORM,
    saville: SAVILLE,
    pearson: PEARSON,
    iiht: IIHT,
    mettl: METTL,
    meeting: MEETING,
    simulation: SIMULATION
  }.freeze

  # Assessments constant
  TYPES = {
    common: 'Assessments::Common',
    hogan: 'Assessments::Hogan',
    saville: 'Assessments::Saville',
    pearson: 'Assessments::Pearson',
    iiht: 'Assessments::Iiht',
    mettl: 'Assessments::Mettl',
    simulation: 'Assessments::Simulation'
  }.freeze

  NON_USER_ASSESSMENT_CATEGORY = [
    CATEGORIES[:assessor_form],
    CATEGORIES[:lead_assessor_form]
  ].freeze

  # STATUSES constant
  STATUSES = %i[in_progress finished].freeze

  ### ASSOCIATIONS
  ##
  belongs_to :dimension
  belongs_to :owner, class_name: 'Client'
  belongs_to :project, class_name: 'Client'
  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'

  has_one :threesixty_campaign, class_name: 'Threesixty::Campaign'
  has_one :campaign, through: :threesixty_campaign

  has_many :blocks, -> { order(position: :asc) }, dependent: :destroy
  has_many :questions, dependent: :destroy
  has_many :highlights, dependent: :destroy
  has_many :norms, through: :dimension
  has_many :communications, dependent: :destroy
  has_many :campaign_templates, dependent: :destroy
  has_many :project_assessments, dependent: :destroy

  # HABTM Factors
  has_many :factors_scoring, dependent: :destroy
  has_many :factors, through: :factors_scoring

  has_many :assessments_reports, dependent: :restrict_with_error
  has_many :reports, through: :assessments_reports

  # HABTM Report Bundles
  has_many :report_families, through: :reports

  has_many :user_assessments, dependent: :restrict_with_error
  has_many :users_results, through: :user_assessments, dependent: :restrict_with_error
  has_many :saville_user_assessments, through: :user_assessments, dependent: :restrict_with_error
  has_many :pearson_user_assessments, through: :user_assessments, dependent: :restrict_with_error
  has_many :iiht_user_assessments, through: :user_assessments, dependent: :restrict_with_error
  has_many :mettl_user_assessments, through: :user_assessments, dependent: :restrict_with_error
  has_many :simulation_user_assessments, through: :user_assessments, dependent: :restrict_with_error
  has_many :campaign_assessments, dependent: :restrict_with_error
  has_many :assessments_clients, dependent: :restrict_with_error
  has_many :assessor_campaign_assessments, dependent: :restrict_with_error,
    class_name: 'CampaignAssessment', foreign_key: :assessor_form_id
  has_many :campaign_factors, dependent: :restrict_with_error
  has_many :idp_template_skills, dependent: :restrict_with_error

  # HABTM Clients
  has_many :clients, through: :reports

  has_one :agile

  has_one :linked_assessor_form, foreign_key: :linked_assessment_id, class_name: 'Assessment'
  belongs_to :linked_assessment, class_name: 'Assessment'

  before_create :init_defaults, if: :common?
  after_create :create_agile, if: :agile?
  before_update ::Callbacks::Models::Assessments::UpdateFactorsAliases.new

  after_commit :invalidate_cache

  #
  ### END ASSOCIATIONS

  validates :type, presence: true, inclusion: { in: TYPES.values }
  validates :dimension, presence: true, if: :common?
  validates :name, presence: true

  serialize :external_settings, coder: PsyJsonbSerializer

  enum category: CATEGORIES
  enum status: STATUSES

  store_accessor :extra, %i[timer icon_color enable_video_check enable_audio_check enable_network_check]

  has_one_image_attachment :icon, variants: [:thumb]
  has_one_image_attachment :poster, variants: [:thumb]

  translates :name, :description, :timing

  def attachment_storage_path(attribute_name, filename)
    "public/assessment/#{id}/#{attribute_name}/#{filename}"
  end

  acts_as_taggable_on :tags
  acts_as_taggable_tenant :owner_id

  delegate :config, :translations, to: :agile, prefix: true

  # TODO: (nest):
  # Creating scope :hogan. Overwriting existing method Assessment.hogan.
  #
  scope :common, -> { where(type: TYPES[:common]) }
  scope :hogan, -> { where(type: TYPES[:hogan]) }
  scope :saville, -> { where(type: TYPES[:saville]) }
  scope :pearson, -> { where(type: TYPES[:pearson]) }
  scope :iiht, -> { where(type: TYPES[:iiht]) }
  scope :mettl, -> { where(type: TYPES[:mettl]) }
  scope :simulation, -> { where(type: TYPES[:simulation]) }
  scope :external, -> { where.has { type.in([TYPES[:hogan]]) } }
  scope :enabled, -> { where.not(disabled: true) }
  scope :disabled, -> { where(disabled: true) }
  scope :archived, -> { where(archived: true) }
  scope :unarchived, -> { where(archived: false) }
  scope :assessor_form, -> { where(category: CATEGORIES[:assessor_form]) }
  scope :with_category, lambda { |category|
    where(category: category)
  }
  scope :owned_by_client_or_tte, lambda { |client_id|
    where('owner_id IS NULL OR owner_id = ?', client_id)
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name category archived]
  end

  def self.ransackable_scopes(_)
    super.concat(%i[owned_by_client_or_tte])
  end

  def self.ransackable_associations(_auth_object = nil)
    super.concat(%i[owner])
  end

  after_commit :sync_translated_columns, on: %i[update create]
  after_commit -> { create_mettl_schedule }, if: :mettl?, on: %i[create]
  after_commit -> { set_mettl_assessment_return_url }, if: :mettl?, on: %i[create]

  def create_mettl_schedule
    Mettl::CreateScheduleJob.perform_later(self)
  end

  def set_mettl_assessment_return_url
    Mettl::SetMettlAssessmentReturnUrlJob.perform_later(external_assessment_id)
  end

  def v2_pearson_assessment?
    v2_pearson_assessment_details.present?
  end

  def pearson_report_id
    v2_pearson_assessment_details&.report_id
  end

  def v2_pearson_assessment_details
    Settings.providers.pearson.v2_assessments.find { |a| external_assessment_id.end_with?(a.id) }
  end

  def has_external_norm?
    saville? || pearson?
  end

  def external_assessment_name # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    return if external_assessment_id.nil? || common?

    case category
      when 'hogan'
        Settings.providers.hogan.assessments.find { |a| a.id.casecmp?(external_assessment_id) }&.name
      when 'saville'
        Settings.providers.saville.assessments.find { |a| a.id.casecmp?(external_assessment_id) }&.name
      when 'pearson'
        PearsonAssessment.find_by(product_id: external_assessment_id)&.title
      when 'mettl'
        MettlAssessment.find_by(product_id: external_assessment_id)&.name
      when 'simulation'
        Settings.providers.simulation.assessments.find { |a| a.id.casecmp?(external_assessment_id) }&.name
      when 'iiht'
        Iiht::GetAssessments.call!(project).find do |a|
          a['assessmentIdNumber'].include?(external_assessment_id)
        end&.fetch('name')
    end
  end

  def external_norm_name
    return if external_norm_id.nil? || common?

    external_norms&.find { |norm| norm[:id] == external_norm_id }&.fetch(:name)
  end

  def external_norms
    return unless pearson? || saville?

    if saville?
      Assessments::SavilleSettings.norms(external_assessment_id)
    elsif pearson?
      Assessments::PearsonSettings.norms(external_assessment_id)
    end
  end

  def simulation_settings
    Settings.providers.simulation.assessments.find do |a|
      a.id == external_assessment_id
    end
  end

  def external_assessment_id
    external_settings[:assessment_id]
  end

  def external_norm_id
    external_settings[:norm_id]
  end

  # Copy assessment
  def clone
    @cloned_item = dup
    @cloned_item.gen_uniq_name
    @cloned_item.copy_and_upload(icon, :icon) if icon.attached?
    @cloned_item.copy_and_upload(poster, :poster) if poster.attached?
    @cloned_item
  end

  def set_default_color
    self.icon_color = Settings.default_colors.sample
  end

  # TODO: Remove, cause does not used
  def active_questions_count
    questions.not_deleted.where(disabled: false).count
  end

  # Return true if assessmnent is Common
  def common?
    type == TYPES[:common]
  end

  def hogan?
    type == TYPES[:hogan]
  end

  def saville?
    type == TYPES[:saville]
  end

  def pearson?
    type == TYPES[:pearson]
  end

  def iiht?
    type == TYPES[:iiht]
  end

  def mettl?
    type == TYPES[:mettl]
  end

  def simulation?
    type == TYPES[:simulation]
  end

  def external?
    hogan? || saville? || pearson? || iiht? || mettl? || simulation?
  end

  def internal?
    !external?
  end

  def agile?
    category == AGILE
  end

  def fixed_timed?
    extra['timer']&.positive?
  end

  class << self
    # Available role for the filter form
    #
    # TODO: Remove, cause does not used
    def options_for_with_category
      CATEGORIES.values
    end

    def options_for_select
      all.map do |assessment|
        [assessment.decorate.display_name, assessment.id]
      end
    end
  end

  def log_attribute_for_delete
    slice(:name)
  end

  def init_defaults
    self.flow ||= { elements: [] }
    self.status = self.class.statuses[:in_progress] unless status
    self.category = self.class.categories[:psychometric] unless category
    self.norm_rules ||= {}
  end

  def serializer_cache_key
    "AssessmentSerializer##{id}"
  end

  def invalidate_cache
    Rails.cache.delete(serializer_cache_key)
  end

  def translations_migrated?
    Settings.features.inline_translation_enabled && translations_migrated
  end
end
