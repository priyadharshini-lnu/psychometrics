module Threesixty
  class CampaignsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign

    def show
      respond_to do |format|
        format.html {}
        format.json do
          manager_participants = @campaign.participants.joins(:relationship).where(relationships: {name: 'Manager'}).where(evaluator_id: current_user.id)

          subjects = @campaign.subjects.where(user_id: current_user.id)
                       .or(Subject.where(user_id: manager_participants.map(&:subject_id)))
                       .includes(:user)
          manager_subjects = @campaign.subjects.includes(:user)
                               .where(user_id: [manager_participants.map(&:subject_id) - [current_user.id]])

          evaluations = @campaign.participants.includes(:evaluator).where(evaluator_id: current_user.id)
          manager_evaluations = @campaign.participants.includes(:subject)
                                  .where(subject_id: [manager_participants.map(&:subject_id) - [current_user.id]])

          render json: @campaign, serializer: Threesixty::CampaignSerializer,
                 subjects: subjects, manager_subjects: manager_subjects,
                 evaluations: evaluations, manager_evaluations: manager_evaluations,
                 include: '**'
        end
      end

    end

    def search_evaluators
      render json: @campaign.evaluators.includes(:user).map(&:user), each_serializer: ::Projects::SearchUserSerializer
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id] || params[:id])
    end
  end
end
