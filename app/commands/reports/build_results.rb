module Reports
  class BuildResults < Rectify::Command
    AVERAGE = 'AVERAGE'
    MIN = 'MIN'
    MAX = 'MAX'
    attr_reader :report, :client, :assign

    def initialize(report, client, assign)
      @report = report
      @client = client
      @assign = assign
    end

    def call
      results = report.flat_data_configuration.map { |data| try(data['type'].to_s, assign, data) || '' }
      broadcast :ok, results
    end

    # Gets user data
    #
    def user_data(assign, data)
      assign.membership.user.try(data['key'])
    end

    # Calculates value for external_result type
    #
    def external_result(assign, data)
      # Skip if the assign is for another assessment
      return unless assign.assessment_id == data['assessmentId']

      assign.external_results.try(:[], data['key'])
    end

    # Calculates value for normed_factor type
    #
    def normed_factor(assign, data)
      # Skip if the assign is for another assessment
      return unless assign.assessment_id == data['assessmentId']
      # Skip if the assign has no norm data
      return unless assign.norm_data

      # Skip if can't find factor
      factor = Factor.find(data['factorId'])
      # Fetches Norm
      # Fetches FactorsNorm by Norm ID and Type
      factors_norm = FactorsNorm.find_by!(factor_id: factor.id,
                                          norm_id: norm.id,
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
      factors_norm.detect_normed_result(scoring)
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.warn e.message
      nil
    end

    # Calculates value for formula type
    #
    def formula(assign, data)
      formula_op = data.dig('formula', 'op')
      results = (data.dig('formula', 'args') || []).map { |arg| try(arg['type'], assign, arg) }.flatten.compact
      return if results.blank?
      return (results.inject(0.0, :+) / results.size.to_f).round(2) if formula_op == AVERAGE
      return results.min if formula_op == MIN
      return results.max if formula_op == MAX

      raise "Formula operation #{formula_op} is not supported"
    end

    def norm
      @norm ||= Norm.find(assign.norm_data['id'])
    end

  end
end
