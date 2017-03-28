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
#  view          :integer          default("assessments")
#  disabled      :boolean          default(FALSE)
#  template_id   :integer
#

class Block < ApplicationRecord
  include Copyable
  
  # For assessment builder
  attr_accessor :save_as_template, :permanent_remove

  belongs_to :assessment
  belongs_to :template, class_name: 'Block'
  has_many :questions, -> { order(position: :asc) }, dependent: :destroy
  has_many :questions_ams, -> { ams }, class_name: 'Question'
  has_many :blocks, class_name: 'Block', foreign_key: :template_id, dependent: :destroy

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  after_update :sync_with_template, if: :template
  before_save :dup_for_template, if: :save_as_template

  acts_as_list scope: :assessment_id
  enum view: [:assessments, :templates]

  scope :deleted, -> { where.not(deleted_at: nil) }
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
      order("blocks.#{column} #{direction}")
    end
  }

  def clone_with_params(params = {})
    cloned_block = deep_clone(include: [:questions])
    cloned_block.position = params[:position] if params[:position]
    cloned_block.name = params[:name] if params[:name]
    cloned_block.save
    cloned_block
  end

  ### Bcenter
  # Create duplicate Assessment Object for Block Center
  def dup_for_template
    self.template = self.class.create(general_attributes.merge({ view: :templates }))
    questions.each do |question|
      template.questions << question.dup_for_block
    end
  end

  # Create duplicate Block Center Object for Assessment
  def dup_for_assessment!(assessment_id)
    block = self.class.create(general_attributes.merge({ view: :assessments, assessment_id: assessment_id, template_id: id }))
    questions.each do |question|
      question.dup_for_assessment!(block.id)
    end
    block
  end

  def general_attributes
    attributes.slice('name', 'props', 'disabled', 'deleted_at')
  end

  ## Assign template to assessments
  def assign_to_assessment_ids
    []
  end

  # TODO: check that assign to block have no double request
  def assign_to_assessment_ids=(assessment_ids)
    ::Assessment.where(id: assessment_ids).each do |assessment|
      assessment.blocks << dup_for_assessment!(assessment.id)
    end
  end

  def sync_with_template
    template.update_attributes(general_attributes)
  end
end
