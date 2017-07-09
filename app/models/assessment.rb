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
#

class Assessment < ApplicationRecord
  include Copyable

  # CATEGORIES constant
  CATEGORIES_TYPES = [
    PSYCHOMETRIC = 'psychometric'.freeze,
    ORGANISATIONAL = 'organisational'.freeze,
    NUM_360 = '360'.freeze,
    MINDMILL = 'mindmill'.freeze
  ].freeze
  CATEGORIES = {
    psychometric: PSYCHOMETRIC,
    organisational: ORGANISATIONAL,
    '360' => NUM_360,
    mindmill: MINDMILL
  }.freeze

  # Assessments constant
  TYPES = {
    common: 'Assessments::Common',
    mindmill: 'Assessments::Mindmill'
  }.freeze

  # STATUSES constant
  STATUSES = %i(in_progress finished).freeze

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

  # HABTM Factors
  has_many :factors_scoring, dependent: :destroy
  has_many :factors, through: :factors_scoring

  # HABTM Report Families
  has_many :reports, dependent: :destroy
  has_many :report_families, through: :reports

  # HABTM Memberships
  has_many :assigns, dependent: :destroy
  has_many :memberships, through: :assigns

  # HABTM Clients
  has_many :clients, through: :reports
  ##
  ### END ASSOCIATIONS

  validates :type, presence: true, inclusion: { in: TYPES.values }

  enum category: CATEGORIES
  enum status: STATUSES

  scope :common, -> { where(type: TYPES[:common]) }
  scope :mindmill, -> { where(type: TYPES[:mindmill]) }
  scope :enabled, -> { where.not(disabled: true) }
  scope :disabled, -> { where(disabled: true) }
  scope :with_category, lambda { |category|
    where(category: category)
  }

  # TODO: Remove, cause does not used
  def active_questions_count
    questions.not_deleted.where(disabled: false).count
  end

  # Return true if assessmnent is Common
  def common?
    type == TYPES[:common]
  end

  # Return true if assessmnent is Mindmill
  def mindmill?
    type == TYPES[:mindmill]
  end

  class << self
    # Available role for the filter form
    #
    # TODO: Remove, cause does not used
    def options_for_with_category
      CATEGORIES.values
    end

    def options_for_select
      all.map { |assessment| [assessment.decorate.display_name, assessment.id, { data: { mindmill: assessment.mindmill? } }] }
    end
  end

  private

  def check_owner
    errors.add(:owner, :invalid) if owner&.ancestors?
  end
end
