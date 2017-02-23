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

  has_many :blocks, -> { order(position: :asc) }, dependent: :destroy
  has_many :questions, dependent: :destroy
  has_many :norms, through: :dimension
  has_many :factors_scoring, dependent: :destroy
  has_many :reports, dependent: :destroy

  has_many :assign_clients, dependent: :destroy
  has_many :clients, through: :assign_clients
  has_many :assigns, dependent: :destroy

  has_many :memberships, through: :assigns
  has_many :assessments_projects, inverse_of: :project
  has_many :projects, through: :assessments_projects

  has_many :communications, dependent: :destroy

  has_many :translations, as: :resource, dependent: :destroy
  has_many :tasks, dependent: :destroy

  belongs_to :dimension
  belongs_to :owner, class_name: 'Client', foreign_key: :owner_id

  CATEGORIES_TYPES = [
      PSYCHOMETRIC = 'psychometric'.freeze,
      ORGANISATIONAL = 'organisational'.freeze,
      NUM_360 = '360'.freeze
  ].freeze

  # CATEGORIES constant
  CATEGORIES = {
      psychometric: PSYCHOMETRIC,
      organisational: ORGANISATIONAL,
      '360' => NUM_360
  }.freeze

  # STATUSES constant
  STATUSES = [:in_progress, :finished].freeze

  validates :name, :dimension, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true
  validates :owner, presence: true, allow_nil: true
  validate :check_owner

  before_create :init

  def init
    self.flow ||= { elements: [] }
    self.status = Assessment.statuses[:in_progress] unless status
    self.norm_rules ||= {}
  end

  enum category: CATEGORIES
  enum status: STATUSES

  scope :enabled, -> { where.not(disabled: true) }

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
      order("assessments.id #{direction}")
    when /^active_/
      order("assessments.disabled #{direction}")
    when /^name_/
      order("assessments.name #{direction}")
    when /^dimension_id_/
      joins(:dimension).order("dimensions.name #{direction}")
    when /^created_at_/
      order("assessments.created_at #{direction}")
    when /^updated_at_/
      order("assessments.updated_at #{direction}")
    end
  }

  # Find by category
  scope :with_category, lambda { |category|
    where(category: category)
  }

  scope :with_client, lambda { |client_id|
    joins(:assign_clients).where(assign_clients: { client_id: client_id })
  }

  def active_questions_count
    questions.not_deleted.where(disabled: false).count
  end

  private

  def check_owner
    errors.add(:owner, :invalid) if owner&.child?
  end

  class << self
    # Available role for the filter form
    #
    def options_for_with_category
      CATEGORIES.values
    end

    def options_for_select
      all.map { |assessment| [assessment.decorate.display_name, assessment.id] }
    end
  end
end
