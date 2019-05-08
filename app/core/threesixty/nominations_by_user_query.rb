module Threesixty
  class NominationsByUserQuery < Rectify::Query
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

      subjects = @campaign.subjects.where(user_id: current_user.id)
                   .or(Subject.where(user_id: manager_ids))
                   .includes(:user)

      manager_subjects = @campaign.subjects.includes(:user)
                           .where(user_id: [manager_ids - [current_user.id]])

      [subjects, manager_subjects]
    end

    private

    attr_reader :current_user
  end
end
