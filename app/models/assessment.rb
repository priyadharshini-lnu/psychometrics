# frozen_string_literal: true

# == Schema Information
#
# Table name: assessments
#
#  id                :integer          not null, primary key
#  name              :string
#  category          :enum             default("psychometric")
#  dimension_id      :integer
#  disabled          :boolean          default(FALSE)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  flow              :json
#  norm_rules        :json
#  description       :text
#  timing            :string
#  access_reports_at :datetime
#  status            :integer
#  owner_id          :integer
#  archived          :boolean          default(false)
#

class Assessment < ApplicationRecord
  include Copyable
  include RansackSearchableFields
  include SoftDelete
  include OwnerValidations

  # CATEGORIES constant
  CATEGORIES_TYPES = [
    PSYCHOMETRIC = 'psychometric',
    ORGANISATIONAL = 'organisational',
    CASE_STUDY = 'case_study',
    THREESIXTY = 'threesixty',
    MINDMILL = 'mindmill',
    ASSESSOR_FORM = 'assessor_form',
    HOGAN = 'hogan',
    AGILE = 'agile',
    SAVILLE = 'saville',
    PEARSON = 'pearson',
    IIHT = 'iiht'
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

  has_one :hogan_assessment_setting, dependent: :destroy
  has_one :saville_assessment_setting, dependent: :destroy
  has_one :pearson_assessment_setting, dependent: :destroy
  has_one :iiht_assessment_setting, dependent: :destroy
  has_one :agile

  accepts_nested_attributes_for :hogan_assessment_setting, :saville_assessment_setting, :pearson_assessment_setting,
                                :iiht_assessment_setting
  before_save :delete_hogan_assessment_setting, :delete_saville_assessment_setting, :delete_pearson_assessment_setting,
              :delete_iiht_assessment_setting
  before_update ::Callbacks::Models::Assessments::UpdateFactorsAliases.new
  #
  ### END ASSOCIATIONS

  validates :type, presence: true, inclusion: { in: TYPES.values }
  validates :dimension, presence: true, if: :common?

  enum category: CATEGORIES
  enum status: STATUSES

  store :extra, accessors: %i[timer icon_color enable_video_check enable_audio_check enable_network_check],
    coder: JsonSerializer

  mount_uploader :icon, ImageUploader
  mount_uploader :poster, ImageUploader

  delegate :config, :translations, to: :agile, prefix: true
  delegate :saville_norm_id, :saville_assessment_id, :saville_norms,
           to: :saville_assessment_setting, allow_nil: true
  delegate :pearson_norm_id, :pearson_assessment_id, :pearson_norms, :pearson_assessment_language,
           to: :pearson_assessment_setting, allow_nil: true
  delegate :iiht_assessment_id_number, :iiht_schedule_config, to: :iiht_assessment_setting, allow_nil: true
  delegate :hogan_assessment_id, to: :hogan_assessment_setting, allow_nil: true

  # TODO: (nest):
  # Creating scope :mindmill. Overwriting existing method Assessment.mindmill.
  # Creating scope :hogan. Overwriting existing method Assessment.hogan.
  #
  scope :common, -> { where(type: TYPES[:common]) }
  scope :mindmill, -> { where(type: TYPES[:mindmill]) }
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

  def external_norms
    return pearson_norms if pearson?
    return saville_norms if saville?
  end

  def external_norm_id
    return pearson_norm_id if pearson?
    return saville_norm_id if saville?
  end

  def external_assessment_id
    return hogan_assessment_id if hogan?
    return saville_assessment_id if saville?
    return pearson_assessment_id if pearson?
    return iiht_assessment_id_number if iiht?
  end

  # Copy assessment with nested resources
  def clone
    @cloned_item = deep_clone include: %i[hogan_assessment_setting saville_assessment_setting]
    @cloned_item.gen_uniq_name
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

  private

  def delete_hogan_assessment_setting
    hogan_assessment_setting.destroy if hogan_assessment_setting && !hogan?
  end

  def delete_saville_assessment_setting
    saville_assessment_setting.destroy if saville_assessment_setting && !saville?
  end

  def delete_pearson_assessment_setting
    saville_assessment_setting.destroy if pearson_assessment_setting && !pearson?
  end

  def delete_iiht_assessment_setting
    iiht_assessment_setting.destroy if iiht_assessment_setting && !iiht?
  end
end
