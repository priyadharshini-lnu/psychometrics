module Reports
  class BuildResults < Rectify::Command
    AVERAGE = 'AVERAGE'
    MIN = 'MIN'
    MAX = 'MAX'
    attr_reader :report, :assigns

    def initialize(report, assigns)
      @report = report
      @assigns = assigns
    end

    def call
      results = report.flat_data_configuration.map { |data| public_send(data['type'].to_s, data) }
      broadcast :ok, results
    end

    # Gets user data
    #
    def user_data(data)
      {
        key: data['key'],
        name: data['label'],
        value: assigns.sample.membership.user.try(data['key'])
      }
    end

    # Calculates value for external_result type
    #
    def external_result(data)
      assign = find_assign_by(data['assessmentId'])
      {
        key: data['key'],
        name: data['label'],
        value: assign&.assessment_id == data['assessmentId'] ? assign.external_results.try(:[], data['key']) : nil
      }
    end

    # Calculates value for normed_factor type
    #
    def normed_factor(data)
      assign = find_assign_by(data['assessmentId'])
      # Skip if can't find factor
      factor = nil
      factor_alias = nil
      factor = Factor.find(data['factorId'])
      factor_alias = factor.aliases.find_by(report_id: report.id)
      # Skip if the assign is for another assessment

      return decorate_factor_result(data, factor, factor_alias) unless assign&.assessment_id == data['assessmentId']

      # Skip if the assign has no norm data
      return decorate_factor_result(data, factor, factor_alias) unless assign.norm_data

      # Fetches Norm
      # Fetches FactorsNorm by Norm ID and Type
      factors_norm = FactorsNorm.find_by!(factor_id: factor.id,
                                          norm_id: assign.norm_data['id'],
                                          type: assign.norm_data['type'].to_s.downcase)
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
      decorate_factor_result(data, factor, factor_alias, factors_norm.detect_normed_result(scoring))
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.warn e.message
      decorate_factor_result(data, factor, factor_alias)
    end

    def decorate_factor_result(data, factor, factor_alias, result = nil)
      {
        key: data['factorId'],
        name: factor_alias&.name || factor&.name,
        value: result
      }
    end


    # Calculates value for formula type
    #
    def formula(data)
      formula_op = data.dig('formula', 'op')
      results = (data.dig('formula', 'args') || []).map { |arg| try(arg['type'], arg).try(:[], :value) }.flatten.compact
      {
        key: data['key'],
        name: data['label'],
        value: calc_formula_value(results, formula_op)
      }
    end

    def calc_formula_value(results, formula_op)
      return if results.blank?
      return (results.inject(0.0, :+) / results.size.to_f).round(2) if formula_op == AVERAGE
      return results.min if formula_op == MIN
      return results.max if formula_op == MAX
      raise "Formula operation #{formula_op} is not supported"
    end

    def find_assign_by(assessment_id)
      @assigns_by_assessment_id ||= assigns.index_by(&:assessment_id)
      @assigns_by_assessment_id[assessment_id]
    end
  end
end
