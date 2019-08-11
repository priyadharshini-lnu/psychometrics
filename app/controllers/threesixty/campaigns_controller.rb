module Threesixty
  class CampaignsController < ApplicationController
    include ::Threesixty::InitialState
    layout 'layouts/threesixty_campaign'
    before_action :set_locale
    before_action :set_campaign, only: [:show]
    initial_state_for [:index, :show]

    def index
      respond_to do |format|
        format.html { render :show }
        format.json do
          @reports_ids = Report.for_clients(@current_project.subtree_ids).enabled.available_to_view.distinct.ids
          @single_assigns = policy_scope(Assign).
                      includes(:single_reports, original_assign: [:single_reports]).
                      joining { original_assign.outer.membership.outer.client.outer }.
                      joins('LEFT OUTER JOIN "assessments_clients" ON "assessments_clients"."client_id" = "clients"."id" AND "assessments_clients"."assessment_id" = "assigns"."assessment_id"').
                      order('assessments_clients.position ASC').
                      preload(:assessment)

          subject_campaigns = Threesixty::Subject.where(user_id: current_user.id).pluck(:campaign_id)
          evaluator_campaigns = Threesixty::Evaluator.where(user_id: current_user.id).pluck(:campaign_id)

          campaigns = ::Campaign.where(id: subject_campaigns | evaluator_campaigns)
          threesixty_projects = campaigns.map(&:threesixty_campaign)

          json = @single_assigns.map{ |assign| ::EndUser::AssignSerializer.new(assign, reports_ids: @reports_ids).to_h }
          json.concat threesixty_projects.map{ |campaign| Threesixty::CampaignSerializer.new(campaign, include: '**').to_h }

          render json: json
        end
      end
    end

    def show
      respond_to do |format|
        format.html { }
        format.json do
          subjects = ::Threesixty::NominationsByUserQuery.new(@campaign, current_user)
          evaluations = ::Threesixty::EvaluationsByUserQuery.new(@campaign, current_user)
          reports = ::Threesixty::UsersReportsQuery.new(@campaign, subjects.query, current_user)

          managed_subjects = if @campaign.option.participants.dig('manager', 'can_approves_evaluations')
            subjects.select{ |subject| subject.user_id != current_user.id }
          end

          render json: @campaign, serializer: Threesixty::CampaignSerializer,
                 subjects: subjects, evaluations: evaluations,
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
