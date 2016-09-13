# == Schema Information
#
# Table name: questions
#
#  id                  :integer          not null, primary key
#  name                :string
#  position            :integer
#  type                :string
#  props               :json
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  block_id            :integer
#  deleted_at          :datetime
#  required_validation :json
#  validation          :json
#

class Question < ApplicationRecord
  include Copyable

  belongs_to :block
  belongs_to :template, class_name: 'Question'
  has_many :comments
  has_many :questions, class_name: 'Question', foreign_key: :template_id, dependent: :destroy

  enum view: [:assessment, :qcenter]

  scope :deleted, -> { where.not(deleted_at: nil) }
  scope :qcenter, -> { where(view: :qcenter) }

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  validates :name, :type, presence: true
  validates :name, length: { maximum: 255 }, allow_blank: true


  filterrific(
    default_filter_params: {
      sorted_by: 'id_desc'
    },
    available_filters: [
      :sorted_by,
      :search_query
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
      order("questions.#{column} #{direction}")
    end
  }

  ### Qcenter
  # Create duplicate object for Question Center
  def dup_for_template
    template = self.class.new(attributes.slice('name', 'props', 'type', 'disabled'))
    template.view = :qcenter
    template
  end

  def dup_for_assessment
    question = self.class.new(attributes.slice('name', 'props', 'type', 'disabled'))
    question.attributes = {view: :assessment, template_id: id}
    question
  end

  ## Assign template to assessments
  def assign_to_assessment_ids
    []
  end

  def assign_to_assessment_ids=(assessment_ids)
    ::Assessment.includes(:blocks).where(id: assessment_ids).each do |assessment|
      assessment.blocks.create!({name: name}) unless assessment.blocks.any?
      assessment.blocks.last.questions << dup_for_assessment
    end
  end

end
