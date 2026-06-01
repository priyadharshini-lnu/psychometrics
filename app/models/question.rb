# frozen_string_literal: true

class Question < ApplicationRecord
  audited

  include Copyable
  include OwnerValidations
  include RansackSearchableFields

  # For assessment builder
  attr_accessor :save_as_template, :permanent_remove

  QUESTIONS_WITH_EXPORTABLE_ANSWERS = %w[
    ConstantSum GapAnalysis GraphicSlider HotSpot MatrixTable MetaInfo
    MultipleChoice PickGroupRank RankOrder SideBySide Slider TextEntry
    Timing FileUpload AudioResponse VideoResponse FactorSelect
    CampaignFactorFeedback
  ].freeze

  belongs_to :block, optional: true
  belongs_to :assessment, touch: true, optional: true
  belongs_to :template, class_name: 'Question', dependent: :destroy
  belongs_to :owner, class_name: 'Client'
  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'
  belongs_to :skill, optional: true

  has_many :questions, class_name: 'Question', foreign_key: :template_id, dependent: :destroy
  has_many :linked_assessments, through: :questions, source: :assessment
  has_many :factors_scorings, dependent: :destroy
  has_many :question_recodings, dependent: :destroy
  has_many :factors_scorings_with_props, -> { with_props }, class_name: 'FactorsScoring', foreign_key: :question_id
  has_many :translations, as: :translateable, dependent: :destroy
  has_many :media_responses, dependent: :nullify
  has_many :campaign_ai_artifact_dependencies, class_name: 'AI::CampaignArtifactDependency',
            foreign_key: 'dependency_id', dependent: :destroy
  has_many :campaign_idp_dependencies, class_name: 'CampaignIdpDependency',
            foreign_key: 'dependency_id', dependent: :destroy

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :assessment, :owner

  enum :view, { assessments: 0, templates: 1, blocks: 2 }

  scope :deleted, -> { where.not(deleted_at: nil) }
  scope :not_deleted, -> { where(deleted_at: nil) }
  scope :ai_scored, lambda {
    not_deleted.where("questions.props ->> 'scoreWithAIEnabled' = 'true'")
  }

  scope :ams, lambda {
    template_table = Question.arel_table.alias('templates_questions')
    questions_table = Question.arel_table

    coalesce_props = Arel::Nodes::NamedFunction.
                     new('COALESCE', [template_table[:props], questions_table[:props]]).as('props')
    coalesce_type = Arel::Nodes::NamedFunction.
                    new('COALESCE', [template_table[:type], questions_table[:type]]).as('type')
    coalesce_name = Arel::Nodes::NamedFunction.
                    new('COALESCE', [template_table[:name], questions_table[:name]]).as('name')

    deleted_at_case = Arel.sql(
      '(CASE WHEN templates_questions.id IS NOT NULL
 THEN templates_questions.deleted_at ELSE questions.deleted_at END) AS deleted_at'
    )
    reposition_case = Arel.sql(
      '(CASE WHEN blocks.template_id IS NOT NULL
 THEN templates_questions.position ELSE questions.position END) AS reposition'
    )

    template_not_disabled = template_table[:disabled].eq(false)
    template_not_present = template_table[:id].eq(nil)

    joins(:block).
      left_outer_joins(:template).
      select('questions.*', coalesce_props, coalesce_type, coalesce_name, deleted_at_case, reposition_case).
      where(template_not_disabled.or(template_not_present)).
      reorder('reposition ASC')
  }

  before_validation -> { self.name = 'PB' }, if: -> { type == 'PageBreak' }
  before_save :dup_for_template, if: :save_as_template
  before_create :set_assessment_id, if: proc { assessment_id.nil? }
  before_create :set_view
  after_create :create_in_template_block, if: proc { block && block.template.present? }
  after_create :create_in_assessments_blocks, if: proc { block&.blocks&.any? }
  after_update :sync_with_template, if: :template

  before_commit :invalidate_assessment_cache

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

  scope :skill_rater, -> { where.not(skill_id: nil) }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name type created_at updated_at view]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[assessment]
  end

  # Ransacker for view enum - converts string values to integers for filtering
  ransacker :view, formatter: proc { |v| views[v] } do |parent|
    parent.table[:view]
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

  def skill_rater?
    type == 'SkillRater'
  end

  def generate_piped_text_mapping(piped_text_context)
    return {} if skill_rater? || props.nil? || props['questionText'].blank?

    PipedText::SubstitutionMappingGenerator.call!(props['questionText'], piped_text_context)
  end

  private

  def invalidate_assessment_cache
    assessment&.invalidate_cache
  end
end
