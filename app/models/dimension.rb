# frozen_string_literal: true

class Dimension < ApplicationRecord
  audited

  include Copyable
  include RansackSearchableFields
  include OwnerValidations

  belongs_to :owner, class_name: 'Client'
  has_many :factors, -> { roots.order(id: :asc) }
  has_many :occupations, dependent: :destroy
  has_many :all_factors, class_name: 'Factor', dependent: :destroy
  has_many :assessments
  has_many :norms, dependent: :destroy
  has_many :innovation_styles, dependent: :destroy
  has_many :occupation_condition_sets, dependent: :destroy
  belongs_to :default_occupation_condition_set, class_name: 'OccupationConditionSet', optional: true
  has_many :innovation_styles_factors, through: :innovation_styles
  has_many :factors_sub_factors, through: :all_factors
  has_many :occupations_factors, through: :occupations
  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'

  attr_accessor :skip_default_ocs_creation

  after_create :create_default_occupation_condition_set, if: -> { occupations_enabled? && !skip_default_ocs_creation }
  after_update :ensure_default_occupation_condition_set, if: :occupations_just_enabled?
  before_destroy :clear_default_condition_set_reference, prepend: true

  tenant_config has_global_records: true, optional: true
  include Tenantable

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true
  validates :owner, presence: true, allow_nil: true

  enum :dimension_type, { regular: 0, skill_rater: 1 }

  before_commit :invalidate_assessment_cache
  after_create_commit :sync_skill_rater_entities, if: :skill_rater?

  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name created_at updated_at]
  end

  def log_attribute_for_delete
    slice(:owner_id, :name)
  end

  def clone_and_save(user_id:)
    dictionary = {}
    @cloned_dimension = deep_clone(
      include: [
        { all_factors: :factors_sub_factors },
        { occupations: { occupations_factors: :factor } },
        { innovation_styles: { innovation_styles_factors: :factor } },
        :occupation_condition_sets
      ],
      dictionary: dictionary
    ) do |original, copied|
      original.class.reflect_on_all_attachments.map(&:name).each do |attachment_name|
        attachment = original.public_send(attachment_name)
        next unless attachment.attached?

        copied.copy_and_upload(
          attachment,
          attachment_name
        )
      end
    end

    factor_id_mapping = build_factor_id_mapping(dictionary)
    condition_set_id_mapping = build_condition_set_id_mapping(dictionary)

    @cloned_dimension.gen_uniq_name
    @cloned_dimension.created_by_id = @cloned_dimension.updated_by_id = user_id
    if @cloned_dimension.save
      remap_factors_relationships_post_save(factor_id_mapping, condition_set_id_mapping)
      @cloned_dimension
    end
  end

  def non_skill_factors
    all_factors.where(skill_id: nil).order(:id)
  end

  def invalidate_assessment_cache
    assessments.each(&:invalidate_cache)
  end

  def sync_skill_rater_entities
    SkillRater::SyncAssessmentEntitiesJob.perform_later(owner_id)
  end

  def self.skill_rater_dimension(project)
    Dimension.find_or_initialize_by(
      dimension_type: :skill_rater, owner_id: project.id
    ).tap do |dimension|
      dimension.name = "#{project.name} - Skill Rater"
      dimension.save!
    end
  end

  private

  def build_factor_id_mapping(dictionary)
    factor_entries = dictionary[:factors] || {}
    factor_entries.transform_keys(&:id)
  end

  def build_condition_set_id_mapping(dictionary)
    set_entries = dictionary[:occupation_condition_sets] || {}
    set_entries.transform_keys(&:id)
  end

  def remap_factors_relationships_post_save(factor_id_mapping, condition_set_id_mapping)
    remap_factor_hierarchies(factor_id_mapping)
    remap_default_condition_set(condition_set_id_mapping)
    remap_occupations_factors(condition_set_id_mapping)
  end

  def remap_factor_hierarchies(factor_id_mapping)
    @cloned_dimension.all_factors.each do |factor|
      factor.factors_sub_factors.each do |fs|
        new_sub_factor = factor_id_mapping[fs.sub_factor_id]
        fs.update_column(:sub_factor_id, new_sub_factor.id) if new_sub_factor
      end

      if factor.parent_id
        new_parent = factor_id_mapping[factor.parent_id]
        factor.update_column(:parent_id, new_parent.id) if new_parent
      end
    end
  end

  def remap_default_condition_set(condition_set_id_mapping)
    return unless @cloned_dimension.default_occupation_condition_set_id

    new_default_set = condition_set_id_mapping[@cloned_dimension.default_occupation_condition_set_id]
    @cloned_dimension.update_column(:default_occupation_condition_set_id, new_default_set.id) if new_default_set
  end

  def remap_occupations_factors(condition_set_id_mapping)
    @cloned_dimension.occupations.flat_map(&:occupations_factors).each do |of|
      next unless of.occupation_condition_set_id

      new_set = condition_set_id_mapping[of.occupation_condition_set_id]
      of.update_column(:occupation_condition_set_id, new_set.id) if new_set
    end
  end

  def occupations_just_enabled?
    saved_change_to_occupations_enabled? && occupations_enabled?
  end

  def create_default_occupation_condition_set
    return if occupation_condition_sets.exists?(name: 'Default')

    set = occupation_condition_sets.create!(name: 'Default', tenant_id: tenant_id)
    update_column(:default_occupation_condition_set_id, set.id)
  end

  def ensure_default_occupation_condition_set
    return if default_occupation_condition_set_id.present?

    existing_set = occupation_condition_sets.first
    if existing_set
      update_column(:default_occupation_condition_set_id, existing_set.id)
    else
      create_default_occupation_condition_set
    end
  end

  def clear_default_condition_set_reference
    update_column(:default_occupation_condition_set_id, nil)
  end
end
