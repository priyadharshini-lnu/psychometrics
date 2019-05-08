module Threesixty
  class EvaluationsByUserQuery < Rectify::Query
    def initialize(campaign, current_user)
      @campaign = campaign
      @current_user = current_user
    end

    def query
      manager_ids = @campaign.participants.joins(:relationship)
                               .where(relationships: {name: 'Manager'})
                               .where(evaluator_id: current_user.id)
                               .where.not(subject_id: current_user.id)
                               .pluck(:subject_id)

      evaluations = @campaign.participants.includes(:evaluator)
                      .where(evaluator_id: current_user.id)

      manager_evaluations = @campaign.participants.includes(:subject)
                              .where(subject_id: manager_ids)

      [evaluations, manager_evaluations]
    end

    private

    attr_reader :current_user
  end
end
