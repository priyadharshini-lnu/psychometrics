# frozen_string_literal: true

module Threesixty
  class CampaignsController < ApplicationController
    include ::Threesixty::InitialState
    include AddCookie

    layout 'layouts/end_user'
    before_action :set_locale
    before_action :set_campaign, only: %i[show options]
    initial_state_for %i[show system_checks]

    def system_checks
      respond_to do |format|
        format.html { render :show }
        format.json do
          assessment = Assessment.find(params[:assessment_id])

          entity =
            if assessment.threesixty?
              Threesixty::Participant.find(params[:id])
            else
              UserAssessment.find(params[:id])
            end

          render json: ::EndUser::SystemChecksSerializer.new.serialize(entity)
        end
      end
    end

    def show
      return redirect_to dashboard_path unless %(active closed).include?(@campaign.campaign.status)

      respond_to do |format|
        format.html
        format.json do
          render json: Threesixty::EndUser::CampaignSerializer.new(
            context: {
              current_user: current_user,
              include: '**',
              system_check_session_id: cookies.signed[:system_check_session_id]
            }
          ).serialize(@campaign)
        end
      end
    end

    def options
      render json: Threesixty::CampaignOptionsSerializer.new(
        context: { current_user: current_user }
      ).serialize(@campaign.option)
    end

    def change_locale
      add_cookie(:locale, params[:locale]) if I18n.available_locales.include?(params[:locale]&.to_sym)
      set_locale
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id] || params[:id])
    end
  end
end
