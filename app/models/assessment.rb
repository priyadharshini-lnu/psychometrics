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

  # CATEGORIES constant
  CATEGORIES_TYPES = [
    PSYCHOMETRIC = 'psychometric',
    ORGANISATIONAL = 'organisational',
    CASE_STUDY = 'case_study',
    THREESIXTY = 'threesixty',
    MINDMILL = 'mindmill',
    HOGAN = 'hogan'
  ].freeze
  CATEGORIES = {
    psychometric: PSYCHOMETRIC,
    organisational: ORGANISATIONAL,
    case_study: CASE_STUDY,
    threesixty: THREESIXTY,
    mindmill: MINDMILL,
    hogan: HOGAN
  }.freeze

  # Assessments constant
  TYPES = {
    common: 'Assessments::Common',
    mindmill: 'Assessments::Mindmill',
    hogan: 'Assessments::Hogan'
  }.freeze

  # STATUSES constant
  STATUSES = %i[in_progress finished].freeze

  ### ASSOCIATIONS
  ##
  belongs_to :dimension
  belongs_to :owner, class_name: 'Client'

  has_many :blocks, -> { order(position: :asc) }, dependent: :destroy
  has_many :questions, dependent: :destroy
  has_many :norms, through: :dimension
  has_many :communications, dependent: :destroy
  has_many :translations, as: :resource, dependent: :destroy
  has_many :tasks, dependent: :destroy
  has_many :campaign_templates, dependent: :destroy

  # HABTM Factors
  has_many :factors_scoring, dependent: :destroy
  has_many :factors, through: :factors_scoring

  has_many :assessments_reports
  has_many :reports, through: :assessments_reports

  # HABTM Report Bundles
  has_many :report_families, through: :reports

  # HABTM Memberships
  has_many :assigns, dependent: :destroy
  has_many :memberships, through: :assigns

  # HABTM Clients
  has_many :clients, through: :reports

  has_one :hogan_assessment_setting
  accepts_nested_attributes_for :hogan_assessment_setting
  before_save :delete_hogan_assessment_setting
  before_update ::Callbacks::Models::Assessments::UpdateFactorsAliases.new
  #
  ### END ASSOCIATIONS

  validates :type, presence: true, inclusion: { in: TYPES.values }
  validates :dimension, absence: true, if: :external?
  validates :dimension, presence: true, if: :common?

  enum category: CATEGORIES
  enum status: STATUSES

  store :extra, accessors: [:icon_color], coder: JsonSerializer

  mount_uploader :icon, ImageUploader

  # TODO: (nest):
  # Creating scope :mindmill. Overwriting existing method Assessment.mindmill.
  # Creating scope :hogan. Overwriting existing method Assessment.hogan.
  #
  scope :common, -> { where(type: TYPES[:common]) }
  scope :mindmill, -> { where(type: TYPES[:mindmill]) }
  scope :hogan, -> { where(type: TYPES[:hogan]) }
  scope :external, -> { where.has { type.in([TYPES[:mindmill], TYPES[:hogan]]) } }
  scope :enabled, -> { where.not(disabled: true) }
  scope :disabled, -> { where(disabled: true) }
  scope :archived, -> { where(archived: true) }
  scope :unarchived, -> { where(archived: false) }
  scope :with_category, lambda { |category|
    where(category: category)
  }

  # Copy report with nested resources
  def clone
    @cloned_item = deep_clone include: [:translations, { questions: :question_recodings }]
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

  def external?
    mindmill? || hogan?
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

  private

  def delete_hogan_assessment_setting
    hogan_assessment_setting.destroy if hogan_assessment_setting && !hogan?
  end
end
