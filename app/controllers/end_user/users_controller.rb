# frozen_string_literal: true

class EndUser::UsersController < ApplicationController
  include ::Threesixty::InitialState
  layout 'layouts/end_user'
  before_action :skip_policy_scope
  before_action :set_locale
  before_action :single_assigns
  initial_state_for %i[dashboard]

  def dashboard
    respond_to do |format|
      format.html {}
      format.json do
        subject_campaigns = Threesixty::Subject.where(user_id: current_user.id).pluck(:campaign_id)
        evaluator_campaigns = Threesixty::Evaluator.where(user_id: current_user.id).pluck(:campaign_id)
        user_campaigns = current_user.campaigns_users.pluck(:campaign_id) | subject_campaigns | evaluator_campaigns

        campaigns = ::Campaign.where(id: user_campaigns, status: %i[active closed]).group_by(&:type)

        json = @single_assigns.uniq.map { |assign| ::EndUser::AssignSerializer.new(assign).to_h }

        json.concat(serializer_campaign(campaigns['common'], ::EndUser::CampaignSerializer)) if campaigns['common']

        if campaigns['threesixty']
          json.concat(serializer_campaign(campaigns['threesixty'].map(&:threesixty_campaign),
                                          Threesixty::CampaignSerializer))
        end

        render json: json
      end
    end
  end

  private

  def serializer_campaign(campaigns, serializer)
    campaigns.map do |campaign|
      serializer.new(campaign, current_user: current_user, include: '**').to_h
    end
  end

  def single_assigns
    @single_assigns = []
    return @single_assigns unless @current_membership

    @single_assigns = policy_scope(Assign).
                      includes(:single_reports, original_assign: [:single_reports]).
                      joining { original_assign.outer.membership.outer.client.outer }.
                      joins(
                        'LEFT OUTER JOIN "assessments_clients"
                        ON "assessments_clients"."client_id" = "clients"."id"
                        AND "assessments_clients"."assessment_id" = "assigns"."assessment_id"'
                      ).
                      order('assessments_clients.position ASC').
                      preload(:assessment)
  end
end
