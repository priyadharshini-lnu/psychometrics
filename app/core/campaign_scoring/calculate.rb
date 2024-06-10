# frozen_string_literal: true

module CampaignScoring
  class Calculate < BaseCommand
    private_attr_reader :campaign, :user, :user_assessments, :campaign_user,
                        :existing_campaign_factor_values

    def initialize(campaign, user)
      @campaign = campaign
      @user = user
      @campaign_user = campaign.campaign_users.find_by(user_id: user.id)
      @existing_campaign_factor_values =
        campaign.campaign_factor_values.where(user_id: user.id).index_by(&:campaign_factor_id)
      @user_assessments = campaign.user_assessments.includes(:users_result).where(
        subject_id: user.id,
        evaluator_id: user.id
      ).completed.index_by(&:assessment_id)
      @factor_values = {}
      @exceptions = {}
    end

    def call
      campaign_user.update(campaign_scores_errors: nil) if campaign_user.campaign_scores_errors.present?
      campaign_factors_sorted_by_formula_factors_at_end.each do |cf, _acc|
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
      existing_campaign_factor_value = existing_campaign_factor_values[campaign_factor.id]&.value
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
      existing_campaign_factor_values[campaign_factor.id]&.value
    end

    def compute_formula(campaign_factor)
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
        }
      }
      lua.datasheet = {
        'value' => proc { |column_name| campaign.datasheet_data(user.email)&.fetch(column_name, nil) }
      }
      lua.helpers = {
        'round' => proc { |value, precision = 0| value.round(precision) },
        'percentile' => proc { |value| Ztable.percentile(value) }
      }
      lua_code = %(
        #{campaign_scoring_variables_as_lua_table}
        #{dependencies_as_lua_variable(campaign_factor)}
        #{campaign_factor.formula}
      )
      LuaEvaluator.eval(lua_code, lua)
    end

    def assessment_factor_score(assessment_id, factor_id, score_type)
      users_result = user_assessments[assessment_id.to_i]&.users_result
      return nil unless users_result

      users_result.scoring&.dig(factor_id.to_i.to_s, score_type)
    end

    def campaign_scoring_variables_as_lua_table
      return nil if campaign.campaign_scoring_variables.blank?

      %(vars = { #{campaign.campaign_scoring_variables.strip.split("\n").join(', ')} })
    end

    def dependencies_as_lua_variable(campaign_factor)
      variables = ''
      campaign_factor.dependencies.each do |cf|
        if cf.numeric_output_type?
          variables += "__#{cf.code} =  #{@factor_values[cf].value} \n"
        elsif cf.string_output_type?
          value = @factor_values[cf].value.gsub("'", "\\\\'")
          variables += "__#{cf.code} =  '#{value}' \n"
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
      return if factor_value == nil

      if campaign_factor.string_output_type? && !factor_value.is_a?(String)
        raise CampaignScoring::Exceptions::WrongOutputType,
              "Expected factor value for '#{campaign_factor.code}' to be a string. Got #{factor_value.class.name}"
      end

      if factor_value.is_a?(Numeric) && factor_value.infinite?
        raise CampaignScoring::Exceptions::WrongOutputType,
              "Expected factor value for '#{campaign_factor.code}'. Got Infinity value"
      end

      if campaign_factor.numeric_output_type? && !factor_value.is_a?(Numeric)
        raise CampaignScoring::Exceptions::WrongOutputType,
              "Expected factor value for '#{campaign_factor.code}' to be a numeric. Got #{factor_value.class.name}"
      end
    end

    def campaign_factors_index_by_code
      @campaign_factors_index_by_code ||= campaign.campaign_factors.index_by(&:code)
    end

    def campaign_factors_sorted_by_formula_factors_at_end
      campaign.campaign_factors.partition { |cf| cf.factor_type != 'formula' }.flatten
    end
  end
end
