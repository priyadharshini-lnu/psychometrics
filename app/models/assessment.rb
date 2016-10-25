# == Schema Information
#
# Table name: assessments
#
#  id           :integer          not null, primary key
#  name         :string
#  category     :enum             default("psychometric")
#  dimension_id :integer
#  disabled     :boolean          default(FALSE)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  flow         :json
#  norm_rules   :json
#  description  :text
#

class Assessment < ApplicationRecord
  include Copyable

  has_many :blocks, -> { order(position: :asc) }
  has_many :questions
  has_many :norms, through: :dimension
  has_many :factors_scoring
  has_many :reports, dependent: :destroy
  has_many :assigns, dependent: :destroy
  has_many :users, through: :assigns
  has_and_belongs_to_many :clients, join_table: :assessments_clients
  belongs_to :dimension


  # CATEGORIES constant
  CATEGORIES = {
    psychometric: 'psychometric',
    organisational: 'organisational',
    '360': '360'
  }.freeze

  validates :name, :dimension, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  before_create :init

  def init
    self.flow ||= {elements: []}
  end

  enum category: CATEGORIES

  filterrific(
    default_filter_params: {
      sorted_by: 'id_desc',
      with_category: CATEGORIES.values.first
    },
    available_filters: [
      :sorted_by,
      :search_query,
      :with_category
    ]
  )

  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  # Sorting
  scope :sorted_by, lambda { |sort_key|
    # extract the sort direction from the param value.
    direction = (sort_key =~ /desc$/) ? 'desc' : 'asc'
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

  def active_questions_count
    questions.not_deleted.where(disabled: false).count
  end

  def related_assign(client_id, user_id)

  end
end
