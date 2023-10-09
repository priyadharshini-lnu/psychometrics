# frozen_string_literal: true

class EndUser::WorkshopsController < ApplicationController
  # will refactor
  include ::Threesixty::InitialState
  layout 'layouts/end_user'
  before_action :set_locale
  initial_state_for %i[show]

  def show
    @workshop = Workshop.
                visible_to_end_user(current_user.id).
                find(params[:id])
    @workshop_campaign = @workshop.campaign
    return redirect_to campaign_path(@workshop_campaign.id) unless %(active closed).include?(@workshop_campaign.status)

    @workshop_user_assessments = @workshop_campaign.
                                 user_assessments.
                                 user_workshop_activities(current_user.id).
                                 order(:schedule_time)

    campaign_user = current_user.campaign_users.find_by(campaign_id: @workshop_campaign.id)
    return redirect_to campaign_path(@workshop_campaign.id) unless campaign_user.schedule_started?

    respond_to do |format|
      format.html { render 'end_user/users/dashboard' }
      format.json do
        render json: @workshop,
               campaign: @workshop_campaign,
               workshop_user_assessments: @workshop_user_assessments,
               serializer: ::EndUser::WorkshopSerializer,
               current_user: current_user
      end
    end
  end
end
