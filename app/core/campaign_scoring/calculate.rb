# frozen_string_literal: true

module CampaignScoring
  # rubocop:disable Metrics/ClassLength
  class Calculate < BaseCommand
    PERMITTED_USER_FIELDS_IN_FORMULA = %w[first_name last_name email age gender timezone photo locale].freeze

    private_attr_reader :campaign, :user, :user_assessments, :campaign_user,
                        :campaign_factor_values_to_reuse, :force_recalculate

    def initialize(campaign, user, force_recalculate: false)
      @campaign = campaign
      @user = user
      @force_recalculate = force_recalculate
      @campaign_user = campaign.campaign_users.find_by(user_id: user.id)
      @user_assessments = campaign.user_assessments.includes(:users_result).where(
        subject_id: user.id
      ).completed.group_by(&:assessment_id).transform_values do |assessments|
        assessments.group_by(&:relationship_id)
      end

      @factor_values = {}
      @exceptions = {}
    end

    def call
      @factor_values = CampaignFactors::CalculateAssessorScoringFactor.call!(campaign, user)

      campaign_user.update(campaign_scores_errors: nil) if campaign_user.campaign_scores_errors.present?
      campaign_factors_sorted_by_formula_factors_at_end.each do |cf|
        calculate_campaign_factor_value(cf)
      rescue StandardError, SyntaxError => e
        @factor_values[cf] = CampaignScoring::FactorValue.new(nil, e)
        Rails.logger.error(e.message)
        if e.is_a?(Lua::Exceptions::Base) || e.is_a?(CampaignScoring::Exceptions::Base) ||
           e.is_a?(CampaignFactors::Exceptions::DependentFactorNotFound)
          errors = campaign_user.campaign_scores_errors || []
          errors << { factor_id: cf.id.to_s, message: e.message }
          campaign_user.update(campaign_scores_errors: errors)
          next
        end
        Sentry.capture_exception(e)
      end

      broadcast :ok, @factor_values
    end

    private

    def calculate_campaign_factor_value(campaign_factor)
      existing_campaign_factor_value = campaign_factor_values_to_reuse[campaign_factor.id]&.value
      if existing_campaign_factor_value
        validate_campaign_factor_value!(campaign_factor, existing_campaign_factor_value)
        return @factor_values[campaign_factor] = CampaignScoring::FactorValue.new(existing_campaign_factor_value)
      end

      computed_campaign_factor_value = case campaign_factor.factor_type
                                         when 'assessment'
                                           assessment_factor_score(
                                             campaign_factor.assessment_id,
                                             campaign_factor.factor_id,
                                             campaign_factor.assessment_score_type
                                           )
                                         when 'assessor_scoring'
                                           assessor_scoring(campaign_factor)
                                         when 'formula'
                                           compute_formula(campaign_factor)
                                       end
      validate_campaign_factor_value!(campaign_factor, computed_campaign_factor_value)

      @factor_values[campaign_factor] = CampaignScoring::FactorValue.new(computed_campaign_factor_value)
    end

    def assessor_scoring(campaign_factor)
      @factor_values[campaign_factor]&.value || campaign_factor_values_to_reuse[campaign_factor.id]&.value
    end

    def campaign_factor_values_to_reuse
      scope = campaign.campaign_factor_values.where(user_id: user.id)
      scope = scope.where(calculation_type: :manual) if force_recalculate

      @campaign_factor_values_to_reuse ||= scope.index_by(&:campaign_factor_id)
    end

    def compute_formula(campaign_factor) # rubocop:disable Metrics/AbcSize
      calculate_dependent_campaign_factors(campaign_factor)

      lua = Lua::State.new
      lua.assessment = {
        'norm_score' => proc { |assessment_id, factor_id|
          assessment_factor_score(assessment_id, factor_id, 'norm_score')
        },
        'raw_score' => proc { |assessment_id, factor_id| assessment_factor_score(assessment_id, factor_id, 'score') },
        'zscore' => proc { |assessment_id, factor_id| assessment_factor_score(assessment_id, factor_id, 'zscore') },
        'percentage_answered' => proc { |assessment_id, factor_id|
          assessment_factor_score(assessment_id, factor_id, 'percentage')
        },
        'form_answer' => proc {
          |assessment_id, question_id, index_of_form_element, relationship_name = Relationship::SELF|
          form_answer(assessment_id, question_id, index_of_form_element, relationship_name)
        },
        'campaign_feedback_answer' => proc { |assessment_id, question_id, code, relationship_name = Relationship::SELF|
          campaign_feedback_answer(assessment_id, question_id, code, relationship_name)
        },
        'answer' => proc { |assessment_id, json_path, relationship_name = Relationship::SELF|
                      answer_from_json_path(assessment_id, json_path, relationship_name)
                    },
        'status' => proc { |assessment_id| assessment_status(assessment_id) }
      }
      lua.user = {
        'fixed_field_value' => proc { |field| user_fixed_field_value(field) },
        'custom_profile_field_value' => proc { |profile_id| user_custom_profile_field_value(profile_id) }
      }
      lua.datasheet = {
        'value' => proc { |column_name| campaign.datasheet_data(user.email)&.fetch(column_name, nil) }
      }
      lua.helpers = {
        'round' => proc { |value, precision = 0| value&.round(precision) },
        'percentile' => proc { |value| Ztable.percentile(value) },
        'average' => proc { |values, precision = nil| calculate_average(values, precision) }
      }
      lua_code = %(
        #{campaign_scoring_variables_as_lua_table}
        #{dependencies_as_lua_variable(campaign_factor)}
        #{campaign_factor.formula}
      )
      value = LuaEvaluator.eval(lua_code, lua)

      value.is_a?(Lua::Table) ? value.to_hash.with_indifferent_access : value
    end

    def calculate_average(values, precision)
      unless values.is_a?(Lua::Table)
        raise CampaignScoring::Exceptions::IncorrectFunctionUsages,
              'helpers.average: First parameter must be a Lua table, and second parameter is precision (integer)'
      end

      values_array = values.to_a
      average = values_array.sum / values_array.size.to_f
      precision.nil? ? average : average.round(precision)
    end

    def assessment_factor_score(assessment_id, factor_id, score_type)
      user_assessment = assessment_of_relationship(assessment_id, Relationship::SELF)
      users_result = user_assessment&.users_result
      return nil unless users_result

      users_result.scoring&.dig(factor_id.to_i.to_s, score_type)
    end

    def form_answer(assessment_id, question_id, index_of_form_element, relationship_name)
      answers = answer_for_question(assessment_id, question_id, relationship_name)
      return nil unless answers

      answers.find { |answer| answer['index'] == index_of_form_element }&.dig('value')
    end

    def campaign_feedback_answer(assessment_id, question_id, code, relationship_name)
      answers = answer_for_question(assessment_id, question_id, relationship_name)
      return nil unless answers

      answers.find { |answer| answer['code'] == code }&.dig('value')
    end

    def answer_from_json_path(assessment_id, json_path, relationship_name)
      user_assessment = assessment_of_relationship(assessment_id, relationship_name)

      users_result = user_assessment&.users_result
      return nil unless users_result

      JsonPath.new(json_path).on(users_result.answers).first
    end

    def answer_for_question(assessment_id, question_id, relationship_name)
      user_assessment = assessment_of_relationship(assessment_id, relationship_name)

      users_result = user_assessment&.users_result
      return nil unless users_result

      users_result.answers&.dig(question_id.to_s, 'answers')
    end

    def assessment_of_relationship(assessment_id, relationship_name)
      relationship = relationships.reverse.find { |r| r.name == relationship_name }

      user_assessments.dig(assessment_id.to_i, relationship&.id)&.first
    end

    def assessment_status(assessment_id)
      assessment = Assessment.find_by(id: assessment_id.to_i)

      unless assessment
        raise CampaignScoring::Exceptions::IncorrectFunctionUsages,
              "assessment.status: Assessment with ID '#{assessment_id}' not found."
      end

      if assessment.category.in?(Assessment::NON_USER_ASSESSMENT_CATEGORY)
        raise CampaignScoring::Exceptions::IncorrectFunctionUsages,
              'assessment.status: Only self-assessment IDs are allowed. Assessor form IDs are not permitted.'
      end

      user_assessment = campaign.user_assessments.self_assessment.find_by(
        assessment_id: assessment_id.to_i,
        subject_id: user.id
      )
      user_assessment&.real_status
    end

    def campaign_scoring_variables_as_lua_table
      return nil if campaign.campaign_scoring_variables.blank?

      %(vars = { #{campaign.campaign_scoring_variables.strip.split("\n").join(', ')} })
    end

    def dependencies_as_lua_variable(campaign_factor)
      variables = ''
      campaign_factor.dependencies.each do |cf|
        next variables += "__#{cf.code} =  nil \n" unless @factor_values[cf].value

        if cf.numeric_output_type?
          variables += "__#{cf.code} =  #{@factor_values[cf].value} \n"
        elsif cf.string_output_type?
          value = @factor_values[cf].value.gsub("'", "\\\\'")
          variables += value ? "__#{cf.code} =  '#{value}' \n" : "__#{cf.code} =  nil \n"
        end
      end
      variables
    end

    def calculate_dependent_campaign_factors(campaign_factor)
      campaign_factors_dependencies = campaign_factor.dependencies
      campaign_factors_dependencies.each do |cf|
        return false if @exceptions.key?(cf)

        calculate_campaign_factor_value(cf) unless @factor_values.key?(cf)
      end

      campaign_factors_dependencies.all? { |cf| @factor_values[campaign_factors_index_by_code[cf.code]].present? }
    end

    def validate_campaign_factor_value!(campaign_factor, factor_value)
      CampaignScoring::CampaignFactorValueValidator.call!(campaign_factor, factor_value)
    end

    def campaign_factors_index_by_code
      @campaign_factors_index_by_code ||= campaign.campaign_factors.index_by(&:code)
    end

    def campaign_factors_sorted_by_formula_factors_at_end
      campaign.campaign_factors.not_external_score.partition { |cf| cf.factor_type != 'formula' }.flatten
    end

    def relationships
      @relationships ||= Relationship.where(type: :global)
    end

    def user_fixed_field_value(field_name)
      if PERMITTED_USER_FIELDS_IN_FORMULA.include?(field_name)
        user.send(field_name)
      end
    end

    def user_custom_profile_field_value(profile_id)
      profile_question_id_and_answer_hash[profile_id.to_s]
    end

    def profile_question_id_and_answer_hash
      @profile_question_id_and_answer_hash ||= user.profile_field_values.joins(:profile_field).to_h do |profile|
        [profile.profile_field.id.to_s, profile.value]
      end
    end
  end
  # rubocop:enable Metrics/ClassLength
end
