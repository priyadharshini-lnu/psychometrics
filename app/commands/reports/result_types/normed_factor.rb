module Reports
  module ResultTypes
    class NormedFactor < BaseType
      def call
        assign = context.find_assign_by(data['assessmentId'])
        # Skip if can't find factor
        factor = nil
        factor_alias = nil
        factor = Factor.find(data['factorId'])
        factor_alias = factor.aliases.find_by(report_id: context.report.id)
        # Skip if the assign is for another assessment

        return decorate(factor, factor_alias) unless assign&.assessment_id == data['assessmentId']

        # Skip if the assign has no norm data
        return decorate(factor, factor_alias) unless assign.norm_data

        # Fetches Norm
        # Fetches FactorsNorm by Norm ID and Type
        factors_norm = FactorsNorm.find_by!(factor_id: factor.id,
                                            norm_id: assign.norm_data['id'],
                                            type: assign.norm_data['type'].to_s.downcase)
        # TODO:
        # I have created a special command for calculate average scoring
        # app/core/assigns/average_scoring => Assigns::AverageScoring
        # Below code can be rewritten
        # Gets scoring
        scoring = assign.scoring&.dig(factor.id.to_s, 'results') || []
        # If there is no results for Factor
        #   Then collect SubFactors results
        if scoring.blank? && factor.parent_id.nil?
          scoring = factor.sub_factor_ids.
            each_with_object([]) { |id, res| res << assign.scoring&.dig(id.to_s, 'results') }.
            flatten.
            compact
        end
        # Detects normed result
        decorate(factor, factor_alias, factors_norm.detect_normed_result(scoring))
      rescue ActiveRecord::RecordNotFound => e
        Rails.logger.warn e.message
        decorate(factor, factor_alias)
      end

      def decorate(factor, factor_alias, result = nil)
        {
          key: data['factorId'],
          name: factor_alias&.name || factor&.name,
          config_data: data,
          value: result
        }
      end
    end

  end
end
