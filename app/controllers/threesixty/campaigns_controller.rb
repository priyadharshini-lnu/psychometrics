# frozen_string_literal: true

module Threesixty
  class CampaignsController < ApplicationController
    include ::Threesixty::InitialState
    layout 'layouts/end_user'
    before_action :set_locale
    before_action :set_campaign, only: [:show]
    initial_state_for %i[show]

    def system_checks
      respond_to do |format|
        format.html { render :show }
        format.json do
          assessment = Assessment.find(params[:assessment_id])

          entity =
            if assessment.threesixty?
              Threesixty::Participant.find(params[:id])
            else
              Assign.find(params[:id])
            end

          render json: entity, serializer: ::EndUser::SystemChecksSerializer
        end
      end
    end

    def show
      respond_to do |format|
        format.html {}
        format.json do
          managed_subjects = Threesixty::Evaluators::GetManagedSubjectsQuery.new(@campaign, current_user).
                             query.includes(:user)
          subjects = ::Threesixty::NominationsByUserQuery.new(@campaign, current_user, managed_subjects)
          evaluations = ::Threesixty::EvaluationsByUserQuery.new(@campaign, current_user)
          reports = ::Threesixty::UsersReportsQuery.new(@campaign, managed_subjects, current_user)

          managed_subjects = [] unless @campaign.option.participants.dig('manager', 'can_approves_evaluations')

          render json: @campaign, serializer: Threesixty::CampaignSerializer,
                 subjects: subjects, evaluations: evaluations, current_user: current_user,
                 managed_subjects: managed_subjects, reports: reports, include: '**'
        end
      end
    end

    def change_locale
      cookies[:locale] = params[:locale] if I18n.available_locales.include?(params[:locale]&.to_sym)
      set_locale
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id] || params[:id])
    end
  end
end
