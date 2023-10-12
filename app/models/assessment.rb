# frozen_string_literal: true

class Assessment < ApplicationRecord # rubocop:disable Metrics/ClassLength
  include Copyable
  include RansackSearchableFields
  include SoftDelete
  include OwnerValidations
  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  PSYCHOMETRIC = 'psychometric'
  ORGANISATIONAL = 'organisational'
  CASE_STUDY = 'case_study'
  THREESIXTY = 'threesixty'
  MINDMILL = 'mindmill'
  ASSESSOR_FORM = 'assessor_form'
  HOGAN = 'hogan'
  AGILE = 'agile'
  SAVILLE = 'saville'
  PEARSON = 'pearson'
  IIHT = 'iiht'

  CATEGORIES_TYPES = [
    PSYCHOMETRIC,
    ORGANISATIONAL,
    CASE_STUDY,
    THREESIXTY,
    MINDMILL,
    ASSESSOR_FORM,
    HOGAN,
    AGILE,
    SAVILLE,
    PEARSON,
    IIHT
  ].freeze

  COMMON_CATEGORIES_TYPES = [
    PSYCHOMETRIC,
    ORGANISATIONAL,
    CASE_STUDY,
    THREESIXTY,
    ASSESSOR_FORM,
    AGILE
  ].freeze

  CATEGORIES = {
    psychometric: PSYCHOMETRIC,
    organisational: ORGANISATIONAL,
    case_study: CASE_STUDY,
    threesixty: THREESIXTY,
    mindmill: MINDMILL,
    hogan: HOGAN,
    agile: AGILE,
    assessor_form: ASSESSOR_FORM,
    saville: SAVILLE,
    pearson: PEARSON,
    iiht: IIHT
  }.freeze

  # Assessments constant
  TYPES = {
    common: 'Assessments::Common',
    mindmill: 'Assessments::Mindmill',
    hogan: 'Assessments::Hogan',
    saville: 'Assessments::Saville',
    pearson: 'Assessments::Pearson',
    iiht: 'Assessments::Iiht'
  }.freeze

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
  has_many :translations, as: :resource, dependent: :destroy
  has_many :tasks, dependent: :destroy
  has_many :campaign_templates, dependent: :destroy

  # HABTM Factors
  has_many :factors_scoring, dependent: :destroy
  has_many :factors, through: :factors_scoring

  has_many :assessments_reports, dependent: :restrict_with_error
  has_many :reports, through: :assessments_reports

  # HABTM Report Bundles
  has_many :report_families, through: :reports

  has_many :assigns, dependent: :restrict_with_error
  has_many :user_assessments, dependent: :restrict_with_error
  has_many :users_results, through: :user_assessments, dependent: :restrict_with_error
  has_many :saville_user_assessments, through: :user_assessments, dependent: :restrict_with_error
  has_many :pearson_user_assessments, through: :user_assessments, dependent: :restrict_with_error
  has_many :iiht_user_assessments, through: :user_assessments, dependent: :restrict_with_error
  has_many :campaign_assessments, dependent: :restrict_with_error
  has_many :assessments_clients, dependent: :restrict_with_error
  has_many :assessor_campaign_assessments, dependent: :restrict_with_error,
    class_name: 'CampaignAssessment', foreign_key: :assessor_form_id
  has_many :memberships, through: :assigns

  # HABTM Clients
  has_many :clients, through: :reports

  has_one :agile

  has_one :linked_assessor_form, foreign_key: :linked_assessment_id, class_name: 'Assessment'
  belongs_to :linked_assessment, class_name: 'Assessment'

  before_create :init_defaults, if: :common?
  after_create :create_agile, if: :agile?
  before_update ::Callbacks::Models::Assessments::UpdateFactorsAliases.new

  #
  ### END ASSOCIATIONS

  validates :type, presence: true, inclusion: { in: TYPES.values }
  validates :dimension, presence: true, if: :common?
  validates :name, presence: true

  serialize :external_settings, PsyJsonbSerializer

  enum category: CATEGORIES
  enum status: STATUSES

  store :extra, accessors: %i[timer icon_color enable_video_check enable_audio_check enable_network_check],
    coder: JsonSerializer

  mount_uploader :icon, Public::ImageUploader
  mount_uploader :poster, Public::ImageUploader

  has_one_image_attachment :as_icon, variants: [:icon]
  has_one_image_attachment :as_poster, variants: [:icon]
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :icon, :poster

  def attachment_storage_path(attribute_name, filename)
    "public/assessment/#{attribute_name}/#{filename}"
  end

  delegate :config, :translations, to: :agile, prefix: true

  # TODO: (nest):
  # Creating scope :mindmill. Overwriting existing method Assessment.mindmill.
  # Creating scope :hogan. Overwriting existing method Assessment.hogan.
  #
  scope :common, -> { where(type: TYPES[:common]) }
  scope :hogan, -> { where(type: TYPES[:hogan]) }
  scope :saville, -> { where(type: TYPES[:saville]) }
  scope :pearson, -> { where(type: TYPES[:pearson]) }
  scope :iiht, -> { where(type: TYPES[:iiht]) }
  scope :external, -> { where.has { type.in([TYPES[:mindmill], TYPES[:hogan]]) } }
  scope :enabled, -> { where.not(disabled: true) }
  scope :disabled, -> { where(disabled: true) }
  scope :archived, -> { where(archived: true) }
  scope :unarchived, -> { where(archived: false) }
  scope :assessor_form, -> { where(category: CATEGORIES[:assessor_form]) }
  scope :with_category, lambda { |category|
    where(category: category)
  }

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
    @cloned_item.icon = icon
    @cloned_item.poster = poster
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

  # Return true if assessmnent is Mindmill
  #
  def mindmill?
    type == TYPES[:mindmill]
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

  def external?
    mindmill? || hogan? || saville? || pearson? || iiht?
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
        [assessment.decorate.display_name, assessment.id, { data: { mindmill: assessment.mindmill? } }]
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
end
