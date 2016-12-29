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
#

class Report < ApplicationRecord
  include Copyable
  self.inheritance_column = :_type_disabled
  belongs_to :assessment
  has_many :pages, class_name: 'Reports::Page', dependent: :destroy
  has_many :filters, class_name: 'Reports::Filter', dependent: :destroy

  has_many :client_reports, dependent: :destroy
  has_many :clients, through: :client_reports

  has_many :translations, as: :resource

  validates :assessment, presence: true
  enum type: [:common, :yti, :eti]

  # Copy report with pages => modules
  def clone
    @cloned_item = deep_clone include: [pages: :modules]
    @cloned_item.gen_uniq_name
    @cloned_item
  end

  filterrific(
    default_filter_params: {
      sorted_by: 'id_desc',
      with_assessment_category: 'all'
    },
    available_filters: [
      :sorted_by,
      :search_query,
      :with_assessment_category,
      :with_assessment
    ]
  )

  scope :enabled, -> { where.not(disabled: true) }
  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  # Sorting
  scope :sorted_by, lambda { |sort_key|
    # extract the sort direction from the param value.
    direction = sort_key =~ /desc$/ ? 'desc' : 'asc'
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

  scope :assigned, lambda {
    joins(:client_reports).where.not(client_reports: { client_id: nil })
  }

  scope :available_to_view, lambda {
    joins(:assessment).where.has { assessment.access_reports_at.eq(nil) | (assessment.access_reports_at <= Time.now) }
  }
end
