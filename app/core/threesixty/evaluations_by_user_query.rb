module Threesixty
  class EvaluationsByUserQuery < Rectify::Query
    def initialize(campaign, current_user)
      @campaign = campaign
      @options = campaign.option
      @current_user = current_user
    end

    def query
      scope = subject_evaluators_scope(@campaign.participants)
      scope
    end

    private

    def subject_evaluators_scope(scope)
      evaluators = scope.where(evaluator_id: current_user.id, manager_nomination_status: :approved).includes(:evaluator)
      evaluators = evaluators.where.not(subject_id: current_user.id) unless subject_evaluate_self?
      evaluators
    end

    def manager_ids
      @campaign.participants.joins(:relationship)
        .where(relationships: {name: 'Manager'})
        .where(evaluator_id: current_user.id)
        .where.not(subject_id: current_user.id)
        .pluck(:subject_id)
    end

    def subject_evaluate_self?
      if @options.participants.dig('subject', 'limit_self_evaluation_by_criteria')
        criteria = @options.participants.dig('subject', 'self_evaluation_criteria')
        return Threesixty::Evaluators::ResolveEvaluatorCriteria.call!(@campaign, current_user, criteria, current_user) if criteria
      end
      @options.participants.dig('subject', 'can_evaluate_self')
    end

    def manager_can_approve_evaluations?
      @options.participants.dig('manager', 'can_approves_evaluations')
    end

    attr_reader :current_user
  end
end
