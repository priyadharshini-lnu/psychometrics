# frozen_string_literal: true

# rubocop:disable Layout/LineLength
module AI
  module Tools
    module Idp
      class AddSkillToPlan < AI::Tools::Base
        class ValidationError < StandardError; end

        description 'Adds a skill with development actions to an Individual Development Plan. '

        param :skill_id,
              desc: 'The numerical ID of the skill to add to the IDP plan. ' \
                    'Must be a valid numerical ID of the skills available in the IDP template.'

        param :development_actions,
              desc: 'Array of development actions for this skill.' \
                    'Each action can be either existing (with ONLY development_action_id) or ' \
                    'custom (must include ALL of the following attributes: name, description, learning_style).' \
                    'Example: [{"development_action_id": 456}, ' \
                    '{"name": "Project Ownership", "description": "Take on the project with around 5 people and lead the effort", "learning_style": "on_the_job"}].' \
                    'Allowed learning_style values: "on_the_job", "structured_learning", "learning_from_others".'

        private_attr_reader :user_idp_plan

        def initialize(user_idp_plan)
          @user_idp_plan = user_idp_plan
        end

        def execute(skill_id:, development_actions:)
          development_actions = parse_development_actions(development_actions)

          validate_params!(skill_id, development_actions)

          user_idp_skill = find_or_create_user_idp_skill!(skill_id)

          development_actions_params = build_development_actions_params(skill_id, development_actions)

          validate_development_actions_forms!(development_actions_params)

          add_development_actions(user_idp_skill, development_actions_params)

          build_success_response(skill_id, user_idp_skill, development_actions_params)
        rescue ValidationError, JSON::ParserError => e
          { error: e.message }
        rescue ActiveRecord::RecordInvalid => e
          { error: "Database validation error: #{e.message}" }
        rescue AI::Tools::Errors::MaximumRetryAttemptsExceededError => e
          { error: "Maximum tool retry attempts exceeded. Last tool response '#{e.message}'" }
        end

        private

        def validate_skill(skill_id)
          errors = []

          if skill_id.blank?
            errors << 'skill_id is required'
          elsif !skill_exists_in_template?(skill_id)
            errors << "Skill with ID '#{skill_id}' is not available in the IDP template"
          end

          errors
        end

        def validate_development_actions_structure(development_actions)
          errors = []

          unless development_actions.is_a?(Array)
            errors << 'development_actions must be an array'
            return errors
          end

          development_actions.each_with_index do |action, index|
            action_errors = validate_development_action_structure(action, index)
            errors.concat(action_errors)
          end

          errors
        end

        def validate_development_action_structure(action, index)
          errors = []
          action_prefix = "Development Action at index #{index}:"

          return ["#{action_prefix} must be a hash"] unless action.is_a?(Hash)

          errors.concat(validate_action_type(action, action_prefix))
          errors.concat(validate_custom_action_fields(action, action_prefix)) if has_custom_fields?(action)

          errors
        end

        def validate_action_type(action, action_prefix)
          return [] if has_action_id?(action) || has_custom_fields?(action)

          ["#{action_prefix} must have either development_action_id (for existing actions) " \
           'or name/description/learning_style (for custom actions)']
        end

        def validate_custom_action_fields(action, action_prefix)
          errors = []
          errors << "#{action_prefix} custom action must have a name" if action['name'].blank?
          errors << "#{action_prefix} custom action must have a description" if action['description'].blank?
          errors.concat(validate_learning_style(action, action_prefix))
          errors
        end

        def validate_learning_style(action, action_prefix)
          return ["#{action_prefix} custom action must have a learning_style"] if action['learning_style'].blank?
          return [] if valid_learning_styles.include?(action['learning_style'])

          ["#{action_prefix} learning_style must be one of: #{valid_learning_styles.join(', ')}"]
        end

        def has_action_id?(action)
          action['development_action_id'].present?
        end

        def has_custom_fields?(action)
          action['name'].present? || action['description'].present? || action['learning_style'].present?
        end

        def valid_learning_styles
          DevelopmentAction.learning_styles.keys
        end

        def skill_exists_in_template?(skill_id)
          idp_template.available_skills.exists?(id: skill_id)
        end

        def idp_template
          @idp_template ||= user_idp_plan.idp_template
        end

        def find_or_create_user_idp_skill!(skill_id)
          user_idp_plan.user_idp_skills.find_or_create_by!(skill_id: skill_id)
        end

        def build_development_actions_params(skill_id, development_actions)
          user_idp_skill = @user_idp_plan.user_idp_skills.find_by(skill_id: skill_id)
          return [] unless user_idp_skill

          development_actions.map do |action|
            action_params = {
              'user_idp_skill_id' => user_idp_skill.id,
              'start_date_time' => action['start_date_time'],
              'end_date_time' => action['end_date_time'],
              'private' => action['private'] || false,
              'progress' => action['progress'] || 0
            }

            if action['development_action_id'].present?
              # Existing development action
              action_params['development_action_id'] = action['development_action_id']
              action_params['source_type'] = 'platform'
            else
              # Custom development action
              action_params.merge!(
                'name' => action['name'],
                'description' => action['description'],
                'learning_style' => action['learning_style'],
                'source_type' => 'ai_generated'
              )
            end

            action_params
          end
        end

        def validate_development_actions_forms!(development_actions_params)
          errors = {}
          development_actions_params.each_with_index do |development_action, index|
            form = ::Idp::DevelopmentAction::SavePlanForm.from_params(development_action).
                   with_context(user_idp_plan)
            next unless form.invalid?

            errors[index + 1] = form.errors.messages
          end

          raise ValidationError, format_validation_errors(errors) if errors.any?
        end

        def format_validation_errors(validation_errors)
          formatted_errors = []
          validation_errors.each do |index, errors|
            errors.each do |field, messages|
              messages.each do |message|
                formatted_errors << "Development Action #{index} #{field}: #{message}"
              end
            end
          end
          formatted_errors.join('; ')
        end

        def parse_development_actions(development_actions)
          development_actions.is_a?(String) ? JSON.parse(development_actions) : development_actions
        end

        def validate_params!(skill_id, development_actions)
          skill_validation_errors = validate_skill(skill_id)
          raise ValidationError, skill_validation_errors.join('; ') if skill_validation_errors.any?

          actions_structure_errors = validate_development_actions_structure(development_actions)
          raise ValidationError, actions_structure_errors.join('; ') if actions_structure_errors.any?
        end

        def add_development_actions(user_idp_skill, development_actions_params)
          ::Idp::Skill::AddDevelopmentActions.call!(@user_idp_plan, user_idp_skill, development_actions_params)
          @user_idp_plan.update!(status: :draft) unless @user_idp_plan.draft?
        end

        def build_success_response(skill_id, user_idp_skill, development_actions_params)
          {
            message: 'Skill and development actions added successfully',
            skill_id: skill_id,
            skill_name: user_idp_skill&.skill&.name,
            actions_count: development_actions_params.length,
            status: @user_idp_plan.status
          }
        end
      end
    end
  end
end
# rubocop:enable Layout/LineLength
