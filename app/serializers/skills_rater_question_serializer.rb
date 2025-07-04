# frozen_string_literal: true

class SkillsRaterQuestionSerializer < Panko::Serializer
  attributes :id, :name, :type, :position, :props, :deleted, :created_at, :block_id,
             :validation, :required_validation, :display_logic, :skip_logic, :template_id, :assessment_id

  delegate :skill, to: :object

  def deleted
    !!object.deleted_at
  end

  def props
    return {} unless skill

    Mobility.with_locale(context[:selected_locale]) do
      {
        skillName: skill.name,
        skillDescription: skill.description,
        proficiencyLevels: proficiency_level.level_definition
      }
    end
  end

  def proficiency_level
    result = Skills::GetProficiencyLevel.call(skill)
    result.dig(:ok, :proficiency_level)
  end

  def validation
    return {} unless object.validation

    object.validation
  end
end
