# frozen_string_literal: true

class SkillRaterQuestionSerializer < Panko::Serializer
  attributes :id, :name, :type, :position, :props, :deleted, :created_at, :block_id,
             :validation, :required_validation, :display_logic, :skip_logic, :template_id, :assessment_id

  delegate :skill, to: :object

  def deleted
    !!object.deleted_at
  end

  def props
    return {} unless skill

    Mobility.with_locale(context[:selected_locale]) do
      not_applicable_config = context[:block].props['not_applicable'] || {}

      base_props = {
        skillName: skill.name,
        skillDescription: skill.description,
        proficiencyLevels: proficiency_level.level_definition,
        notApplicable: not_applicable_config['enabled'] || false,
        notApplicableLabel: not_applicable_config['label']
      }

      if (translation_props = context.dig(:translations, 'block', context[:block].id,
                                          'props')) && translation_props['not_applicable']
        base_props[:notApplicableLabel] = translation_props['not_applicable']['label']
      end

      base_props
    end
  end

  def required_validation
    context[:block].props['required_validation'] || { enabled: false }
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
