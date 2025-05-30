# frozen_string_literal: true

module IdpTemplates
  class SkillsOrTagsPresenceValidator < BaseCommand
    attr_accessor :context, :skills, :project_id, :errors

    SKILLS_SETTINGS = {
      behavioral_global_skill_settings: {
        tags_key: :behavioural_global_tags, type: :behavioral, global: true
      },
      behavioral_client_skill_settings: {
        tags_key: :behavioural_client_tags, type: :behavioral, global: false
      },
      technical_global_skill_settings: {
        tags_key: :technical_global_tags, type: :technical, global: true
      },
      technical_client_skill_settings: {
        tags_key: :technical_client_tags, type: :technical, global: false
      }
    }.freeze

    def initialize(context, skills, project_id)
      @context = context
      @skills = skills
      @project_id = project_id
      @errors = {}
    end

    def call
      SKILLS_SETTINGS.each do |attribute, config|
        next unless context_attribute_value(attribute) == 'selected'

        tags = context[config[:tags_key]]

        if tags.blank? && !skills_present?(config)
          errors[attribute] = I18n.t('dry_errors.errors.idp_template.tag_or_skill_required')
        end
      end

      if errors.any?
        broadcast(:errors, errors)
      else
        broadcast(:ok)
      end
    end

    private

    def context_attribute_value(attribute)
      context.respond_to?(attribute) ? context.public_send(attribute) : context[attribute]
    end

    def skills_present?(config)
      return false if skills.blank?

      if skills.is_a?(Array)
        ::Skill.exists?(
          id: skills.pluck(:id),
          skill_type: config[:type],
          project_id: config[:global] ? nil : project_id
        )
      else
        skills.any? do |skill|
          skill[:skill_type] == config[:type].to_s &&
            (config[:global] ? skill[:project_id].nil? : skill[:project_id] == project_id)
        end
      end
    end
  end
end
