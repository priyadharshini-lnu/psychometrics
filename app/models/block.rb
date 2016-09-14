# == Schema Information
#
# Table name: blocks
#
#  id            :integer          not null, primary key
#  name          :string
#  position      :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  assessment_id :integer
#  deleted_at    :datetime
#  props         :json
#

class Block < ApplicationRecord
  include Copyable

  belongs_to :assessment
  belongs_to :original, class_name: 'Block'
  has_many :questions, -> { order(position: :asc) }
  has_many :blocks, class_name: 'Block', foreign_key: :template_id


  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  scope :deleted, -> { where.not(deleted_at: nil) }

  acts_as_list scope: :assessment_id

  enum view: [:assessments, :templates]

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
      order("blocks.#{column} #{direction}")
    end
  }

  def deep_clone(name:, position:)
    cloned_block = dup
    cloned_block.position = position if position
    cloned_block.name = name if name
    cloned_block.save
    cloned_block.questions.create(questions.map { |question| question.attributes.except('id', 'created_at', 'updated_at') })
    cloned_block
  end

  #
  # Move down all questions, which have position more than base_position
  #
  def shift_down_all_questions(base_position)
    questions.where("position > #{base_position}").update_all('position = position + 1')
  end


  ### Bcenter
  # Create duplicate Assessment Object for Block Center
  def dup_for_template
    template = self.class.new(general_attributes)
    template.view = :templates
    questions.each do |question|
      template.questions << question.dup_for_block
    end
    template
  end

  # Create duplicate Block Center Object for Assessment
  def dup_for_assessment
    block = self.class.new(general_attributes)
    block.attributes = {view: :assessments, template_id: id}
    questions.each do |question|
      block.questions << question.dup_for_assessment
    end
    block
  end

  def general_attributes
    attrs = attributes.slice('name', 'props', 'disabled')
    attrs['props'] = (props || {}).except(:randomization)
    attrs
  end

  ## Assign template to assessments
  def assign_to_assessment_ids
    []
  end

  def assign_to_assessment_ids=(assessment_ids)
    ::Assessment.where(id: assessment_ids).each do |assessment|
      assessment.blocks << dup_for_assessment
    end
  end
end
