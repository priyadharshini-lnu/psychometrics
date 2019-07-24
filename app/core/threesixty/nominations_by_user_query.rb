module Threesixty
  class NominationsByUserQuery < Rectify::Query
    def initialize(campaign, current_user)
      @campaign = campaign
      @options = @campaign.option
      @current_user = current_user
    end

    def query
      scope = self_subject_scope(@campaign.subjects)
      scope = scope.or(Subject.where(user_id: manager_ids, campaign_id: @campaign.campaign_id).includes(:user)) if manager_can_manage_evaluations?

      scope
    end

    def self_subject_scope scope
      if subject_can_manage_evaluations?
        scope.where(user_id: current_user.id).includes(:user)
      else
        scope.where('1=0').includes(:user)
      end
    end

    def manager_ids
      @campaign.participants.joins(:relationship)
        .where(relationships: { name: 'Manager', type: :global })
        .where(evaluator_id: current_user.id)
        .where.not(subject_id: current_user.id)
        .pluck(:subject_id)
    end

    private

    def subject_can_manage_evaluations?
      @options.participants.dig('subject', 'can_nominate_evaluators')
    end

    def manager_can_manage_evaluations?
      manager_opts = @options.participants['manager']
      manager_opts['can_view_nominations'] || manager_opts['can_choose_evaluators']
    end

    attr_reader :current_user
  end
end
