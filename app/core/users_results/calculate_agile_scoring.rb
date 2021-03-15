# frozen_string_literal: true

module UsersResults
  class CalculateAgileScoring < BaseCommand
    private_attr_accessor :user_result, :agile, :norm, :results, :current_user, :dimension

    def initialize(user_result, current_user)
      @user_result = user_result
      assessment = user_result.user_assessment.assessment
      @agile = assessment.agile
      @current_user = current_user
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
      scoring = get_factors_scoring

      broadcast :ok, ::UsersResults::Scoring::Extend.call!(scoring, norm, dimension)
    end

    private

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
          question['scoring'] ||= block.dig('scoring') || []
          question
        end
      end.flatten

      factor_ids.each do |factor_id|
        scoring[factor_id.to_s] = { results: [] }
        factor_questions = questions.select do |question|
          question['scoring'].detect { |s| s['factorId'] == factor_id }
        end

        factor_questions.each do |factor_question|
          scoring_class = "::AgileScoring::#{factor_question['question_type']}".safe_constantize
          result = results[factor_question['id']]
          next if result.nil? || factor_question['answers'].nil?

          factor_scoring = factor_question['scoring'].detect { |s| s['factorId'] == factor_id }
          scoring_point = scoring_class.new.calculate(factor_question, result, factor_scoring)
          scoring[factor_id.to_s][:results] << { question_id: factor_question['id'], value: scoring_point }
        end
      end
      scoring
    end
  end
end
