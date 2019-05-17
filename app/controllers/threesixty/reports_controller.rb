module Threesixty
  class ReportsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_users_report

    def index
      respond_to do |format|
        format.html { render 'threesixty/campaigns/show' }
      end
    end

    def show
      respond_to do |format|
        format.html { render 'threesixty/campaigns/show' }
        format.json do
          results = Threesixty::Reports::ResultsForSubject.call!(@campaign, @users_report)
          render json: @users_report, report: @campaign.report,
                 results: results, include: '**'
        end
      end
    end

    private

    def set_users_report
      @users_report = UsersReport.find_by!(id: params[:id], campaign_id: @campaign.campaign_id)
    end

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

  end
end
