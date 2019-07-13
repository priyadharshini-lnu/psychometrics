module Builders
  class ScoringBuilder
    # Authorisation flow
    include Pundit
    include Administration::Policies
    ## Custom current user helper for Pundit
    def pundit_user
      current_user
    end

    attr_accessor :current_user, :scoring_list, :question_recoding_list, :assessment, :factor_scoring_map, :question_recoding_map

    def initialize(assessment, scoring, question_recoding, current_user)
      @current_user = current_user
      @assessment = assessment
      @scoring_list = scoring.map(&:permit!)
      @question_recoding_list = question_recoding.map(&:permit!)
      @factor_scoring_map = FactorsScoring.where(assessment: assessment).index_by { |fs| [fs.factor_id, fs.question_id] }
      @question_recoding_map = QuestionRecoding.where(assessment: assessment).index_by(&:question_id)
    end

    def save!
      ActiveRecord::Base.transaction do
        save_factor_scoring!
        save_question_recoding!
      end
    end

    def save_factor_scoring!
      scoring_list.each do |scoring|
        existing_scoring = factor_scoring_map[[scoring[:factor_id], scoring[:question_id]]]
        next if existing_scoring && existing_scoring.props == scoring[:props].map(&:to_h)
        next if scoring[:props].empty? && !existing_scoring

        factors_scoring = existing_scoring || FactorsScoring.new(
          factor_id: scoring[:factor_id],
          question_id: scoring[:question_id],
          assessment_id: assessment.id
        )
        factors_scoring.update!(props: scoring[:props])
      end
    end

    def save_question_recoding!
      question_recoding_list.each do |recoding|
        existing_recoding = question_recoding_map[recoding[:question_id]]
        next if existing_recoding && existing_recoding.props == recoding[:props].map(&:to_h)
        next if recoding[:props].empty? && !existing_recoding

        factors_scoring = existing_recoding || QuestionRecoding.new(
          question_id: recoding[:question_id],
          assessment_id: assessment.id
        )
        factors_scoring.update!(props: recoding[:props])
      end
    end
  end
end
