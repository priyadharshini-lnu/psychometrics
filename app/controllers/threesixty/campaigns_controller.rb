module Threesixty
  class CampaignsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign, only: [:show]

    def index
      render :show
    end

    def show
      respond_to do |format|
        format.html {}
        format.json do
          subjects = ::Threesixty::NominationsByUserQuery.new(@campaign, current_user)
          evaluations = ::Threesixty::EvaluationsByUserQuery.new(@campaign, current_user)
          reports = ::Threesixty::UsersReportsQuery.new(@campaign, subjects.query, current_user)

          render json: @campaign, serializer: Threesixty::CampaignSerializer,
                 subjects: subjects, evaluations: evaluations,
                 reports: reports, include: '**'
        end
      end

    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id] || params[:id])
    end
  end
end
