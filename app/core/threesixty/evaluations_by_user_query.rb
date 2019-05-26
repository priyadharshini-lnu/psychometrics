module Threesixty
  class EvaluationsByUserQuery < Rectify::Query
    def initialize(campaign, current_user)
      @campaign = campaign
      @options = campaign.option
      @current_user = current_user
    end

    def query
      scope = subject_evaluators_scope(@campaign.participants)
      scope = scope.or(@campaign.participants.where(subject_id: manager_ids)
                                .includes(:evaluator)) if manager_can_approve_evaluations?
      scope
    end

    private

    def subject_evaluators_scope(scope)
      evaluators = scope.where(evaluator_id: current_user.id).includes(:evaluator)
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
      subject_opts = @options.participants['subject']
      subject_opts['can_evaluate_self']
    end

    def manager_can_approve_evaluations?
      manager_opts = @options.participants['manager']
      manager_opts['can_approves_evaluations']
    end

    attr_reader :current_user
  end
end
