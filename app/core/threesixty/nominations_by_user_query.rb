# frozen_string_literal: true

module Threesixty
  class NominationsByUserQuery < Rectify::Query
    private_attr_reader :campaign, :current_user, :option, :managed_subjects

    def initialize(campaign, current_user, managed_subjects)
      @campaign = campaign
      @current_user = current_user
      @option = @campaign.option
      @managed_subjects = managed_subjects
    end

    def query
      scope = self_subject_scope(campaign.subjects)
      scope = scope.or(managed_subjects) if manager_can_manage_evaluations?

      scope
    end

    def self_subject_scope(scope)
      if subject_can_view_evaluators?
        scope.where(user_id: current_user.id).includes(:user)
      else
        scope.where('1=0').includes(:user)
      end
    end

    private

    def subject_can_view_evaluators?
      option.participants.dig('subject', 'can_nominate_evaluators') ||
        option.participants.dig('subject', 'can_view_evaluators')
    end

    def manager_can_manage_evaluations?
      manager_opts = option.participants['manager']
      manager_opts['can_view_nominations'] ||
        manager_opts['can_choose_evaluators'] ||
        manager_opts['can_approve_nominations']
    end

    attr_reader :current_user
  end
end
