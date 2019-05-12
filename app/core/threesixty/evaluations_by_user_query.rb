module Threesixty
  class EvaluationsByUserQuery < Rectify::Query
    def initialize(campaign, current_user)
      @campaign = campaign
      @current_user = current_user
    end

    def query
      evaluations = @campaign.participants.includes(:evaluator)
                      .where(evaluator_id: current_user.id)

      manager_evaluations = @campaign.participants.includes(:subject)
                              .where(subject_id: manager_ids)

      scope = self_subject_scope(@campaign.participants)
      scope = scope.or(Participant.where(user_id: manager_ids).includes(:evaluator)) if manager_can_manage_evaluations?

      scope
      [evaluations, []]
    end

    private

    def self_subject_scope scope
      if subject_can_manage_evaluations?
        scope.where(evaluator_id: current_user.id).includes(:evaluator)
      else
        scope.where('1=0').includes(:evaluator)
      end
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
