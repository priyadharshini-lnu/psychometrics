class Report < ApplicationRecord
  include Copyable

  belongs_to :assessment
  has_many :pages, class_name: 'Reports::Page', dependent: :destroy

  validates :assessment, presence: true

  before_create :init

  def init
    self.filters ||= []
  end

  filterrific(
    default_filter_params: {
      sorted_by: 'id_desc'
    },
    available_filters: [
      :sorted_by,
      :search_query,
      :with_assessment_category,
      :with_assessment
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
    column = sort_key.gsub("_#{direction}", '')
    if column.in?(%w(id name created_at updated_at))
      order("reports.#{column} #{direction}")
    end
  }

  # Search entity by assessment category
  scope :with_assessment_category, lambda { |assessment_category|
    assessment_category == 'all' ? all : joins(:assessment).where(assessments: { category: assessment_category })
  }

  # Search entity by assessment
  scope :with_assessment, lambda { |assessment_id|
    where(assessment_id: assessment_id)
  }
end
