# frozen_string_literal: true

module UsersResults
  class CalculateAgileScoring < BaseCommand
    private_attr_accessor :user_result, :agile, :norm, :results, :dimension

    def initialize(user_result)
      @user_result = user_result
      assessment = user_result.user_assessment.assessment
      @agile = assessment.agile
      @dimension = assessment.dimension
    end

    def call
      return broadcast(:invalid) if user_result.answers.blank?

      @results = user_result.answers.map { |hash| hash['answers'] }.reduce(&:merge)

      if user_result.norm_id
        @norm = Norm.
                includes(:factors_norms, dimension: [factors: %i[sub_factors factors_sub_factors]]).
                find_by(id: user_result.norm_id)
      end

      # { factor_id => {"blocks" => [] }, ... }
      scoring, factors_question_count = get_factors_scoring

      broadcast :ok, ::UsersResults::Scoring::Extend.call!(
        {
          dimension: dimension,
          scoring: scoring,
          norm_data: norm,
          external_results: user_result.external_results,
          factors_question_count: factors_question_count
        }
      )
    end

    private

    # rubocop:disable Metrics/CyclomaticComplexity
    # rubocop:disable Metrics/PerceivedComplexity
    # rubocop:disable Metrics/AbcSize
    def get_factors_scoring
      factor_ids = dimension.factors.map(&:id)
      scoring = {}
      assessments = agile.config['groups'].map do |group|
        group['scenes'].select { |s| s['type'] == 'AssessmentScene' }
      end.flatten

      blocks = assessments.map { |assessment| assessment.dig('data', 'blocks') }.flatten
      questions = blocks.map do |block|
        block['questions'].map do |question|
          question['question_type'] = block['type']
          question['scoring'] ||= block['scoring'] || []
          question
        end
      end.flatten

      factors_question_count = {}

      factor_ids.each do |factor_id|
        scoring[factor_id.to_s] = { results: [] }
        factor_questions = questions.select do |question|
          question['scoring'].detect { |s| s['factorId'] == factor_id }
        end

        factors_question_count[factor_id] = factor_questions.length
        factor_questions.each do |factor_question|
          scoring_class = "::AgileScoring::#{factor_question['question_type']}".safe_constantize
          result = results[factor_question['id']]
          next if result.nil? || factor_question['answers'].nil?

          factor_scoring = factor_question['scoring'].detect { |s| s['factorId'] == factor_id }
          scoring_point = scoring_class.new.calculate(factor_question, result, factor_scoring)
          scoring[factor_id.to_s][:results] << { question_id: factor_question['id'], value: scoring_point }
        end
      end
      return scoring, factors_question_count
    end
    # rubocop:enable all
  end
end
