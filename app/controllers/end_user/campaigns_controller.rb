# frozen_string_literal: true

module EndUser
  class CampaignsController < ApplicationController
    include ::Threesixty::InitialState
    include AuthenticateAnonymousUser
    layout 'layouts/end_user'

    prepend_before_action :authenticate_anonymous_user!
    before_action :set_campaign
    initial_state_for %i[show]

    def show
      respond_to do |format|
        format.html { render 'campaigns/show' }
        format.json do
          render json: ::EndUser::CampaignSerializer.new(@campaign, current_user: current_user, include: '**').to_h
        end
      end
    end

    private

    def set_campaign
      campaign_ids = current_user.campaign_users.pluck(:campaign_id)
      @campaign = ::Campaign.visible_to_end_user.where(id: campaign_ids).find(params[:campaign_id] || params[:id])
    end
  end
end
