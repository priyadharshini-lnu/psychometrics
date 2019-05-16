module Threesixty
  class CampaignsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign

    def show
      respond_to do |format|
        format.html {}
        format.json do
          subjects = ::Threesixty::NominationsByUserQuery.new(@campaign, current_user)
          evaluations = ::Threesixty::EvaluationsByUserQuery.new(@campaign, current_user)

          render json: @campaign, serializer: Threesixty::CampaignSerializer,
                 subjects: subjects, evaluations: evaluations, reports: [],
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
