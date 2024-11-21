# frozen_string_literal: true

class Question < ApplicationRecord
  audited

  include Copyable
  include OwnerValidations

  # For assessment builder
  attr_accessor :save_as_template, :permanent_remove

  belongs_to :block
  belongs_to :assessment, touch: true
  belongs_to :template, class_name: 'Question', dependent: :destroy
  belongs_to :owner, class_name: 'Client'
  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'

  has_many :questions, class_name: 'Question', foreign_key: :template_id, dependent: :destroy
  has_many :factors_scorings, dependent: :destroy
  has_many :question_recodings, dependent: :destroy
  has_many :factors_scorings_with_props, -> { with_props }, class_name: 'FactorsScoring', foreign_key: :question_id
  has_many :translations, as: :translateable, dependent: :destroy
  has_many :media_responses, dependent: :nullify

  enum view: { assessments: 0, templates: 1, blocks: 2 }

  scope :deleted, -> { where.not(deleted_at: nil) }
  scope :not_deleted, -> { where(deleted_at: nil) }
  scope :ams, lambda {
    selecting do
      ['questions.*',
       coalesce(template.props, props).as('props'),
       coalesce(template.type, type).as('type'),
       coalesce(template.name, name).as('name'),
       '(CASE WHEN templates_questions.id IS NOT NULL
 THEN templates_questions.deleted_at ELSE questions.deleted_at END) AS deleted_at',
       '(CASE WHEN blocks.template_id IS NOT NULL
 THEN templates_questions.position ELSE questions.position END) AS reposition']
    end.
      joining { template.outer }.
      joining { block }.
      where.has { (template.disabled == false) | (template.id == nil) }.
      reorder('reposition ASC')
  }

  before_validation -> { self.name = 'PB' }, if: -> { type == 'PageBreak' }
  before_save :dup_for_template, if: :save_as_template
  before_create :set_assessment_id, if: proc { assessment_id.nil? }
  before_create :set_view
  after_create :create_in_template_block, if: proc { block && block.template.present? }
  after_create :create_in_assessments_blocks, if: proc { block&.blocks&.any? }
  after_update :sync_with_template, if: :template

  after_commit :invalidate_assessment_cache

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  validates :name, :type, presence: true
  validates :name, length: { maximum: 255 }, allow_blank: true
  validates :owner, presence: true, allow_nil: true

  acts_as_list scope: :block_id

  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name created_at updated_at]
  end

  # Using for deep clone in Assessment model
  def set_assessment_id
    self.assessment_id = block.try(:assessment_id)
  end

  ### Qcenter
  # Create duplicate object for Question Center
  def dup_for_template
    self.template = self.class.create(general_attributes.merge(view: :templates))
  end

  # Create duplicate object for Block Center
  def dup_for_block
    self.class.new(general_attributes.merge(view: :blocks))
  end

  def dup_for_assessment!(block_id)
    question = self.class.new(general_attributes.merge(view: :assessments, block_id: block_id))
    questions << question
    save
    question
  end

  def general_attributes
    attributes.slice('name', 'props', 'type', 'disabled', 'deleted_at')
  end

  ## Assign template to assessments
  def assign_to_assessment_ids
    []
  end

  def assign_to_assessment_ids=(assessment_ids)
    ::Assessment.includes(:blocks).find_each(id: assessment_ids) do |assessment|
      if assessment.blocks.empty? || assessment.blocks.last.try(:template_id).present?
        assessment.blocks.create!(name: name)
      end
      dup_for_assessment!(assessment.blocks.last.id)
    end
  end

  def sync_with_template
    template.update(general_attributes)
  end

  def set_view
    # If this question assigned to Template Block
    self.view = :blocks if block&.templates?
  end

  # When create new question in Template Block from Assessment Center
  def create_in_template_block
    block.template.questions << dup_for_block! unless template
  end

  # When create new question in Template Block from Block Center
  def create_in_assessments_blocks
    block.blocks.each { |b| dup_for_assessment!(b.id) }
  end

  def detect_specified_scoring
    factors_scorings.detect { |fs| fs.props.present? }&.props || []
  end

  def of_sub_type?(*types)
    types.include?(props['type'])
  end

  private

  def invalidate_assessment_cache
    assessment&.invalidate_cache
  end
end
