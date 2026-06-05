# frozen_string_literal: true

class Block < ApplicationRecord
  audited

  include Copyable

  # For assessment builder
  attr_accessor :save_as_template, :permanent_remove

  belongs_to :assessment
  belongs_to :template, class_name: 'Block'
  has_many :questions, -> { order(position: :asc) }, dependent: :destroy
  has_many :questions_ams, -> { ams }, class_name: 'Question'
  has_many :blocks, class_name: 'Block', foreign_key: :template_id, dependent: :destroy
  has_many :linked_assessments, through: :blocks, source: :assessment
  has_many :translations, as: :translateable, dependent: :destroy
  belongs_to :owner, class_name: 'Client'

  include Tenantable

  tenant_source :assessment, :owner

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  before_save :dup_for_template, if: :save_as_template
  after_update :sync_with_template, if: :template

  before_commit :invalidate_assessment_cache

  acts_as_list scope: :assessment_id
  enum :view, { assessments: 0, templates: 1 }

  scope :deleted, -> { where.not(deleted_at: nil) }
  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  enum :block_type, {
    regular: 0,
    skill_rater: 1
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name created_at view]
  end

  # Ransacker for view enum - converts string values to integers for filtering
  ransacker :view, formatter: proc { |v| views[v] } do |parent|
    parent.table[:view]
  end

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
    self.template = self.class.create(general_attributes.merge(view: :templates))
    questions.each do |question|
      template.questions << question.dup_for_block
    end
  end

  # Create duplicate Block Center Object for Assessment
  def dup_for_assessment!(assessment_id)
    block = self.class.create(general_attributes.merge(
                                view: :assessments, assessment_id: assessment_id, template_id: id
                              ))
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
    ::Assessment.find_each(id: assessment_ids) do |assessment|
      assessment.blocks << dup_for_assessment!(assessment.id)
    end
  end

  def sync_with_template
    template.update(general_attributes)
  end

  def generate_piped_text_mapping(piped_text_context)
    piped_text = {}

    questions.each do |question|
      unless skill_rater?
        piped_text.merge!(question.generate_piped_text_mapping(piped_text_context))
      end
    end

    return piped_text unless props && props['staticContent']

    piped_text.merge!(PipedText::SubstitutionMappingGenerator.call!(props['staticContent']['value'],
                                                                    piped_text_context))
    piped_text
  end

  private

  def invalidate_assessment_cache
    assessment&.invalidate_cache
  end
end
