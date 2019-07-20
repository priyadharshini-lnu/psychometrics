# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class RelationshipsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      append_before_action :pundit_authorize
      skip_after_action :verify_policy_scoped, only: [:index]

      def index
        render json: ::Relationships::ByCampaign.new(threesixty_campaign.campaign).to_a
      end

      def fetch_with_usage
        relationships = ::Relationships::ByCampaign.new(threesixty_campaign.campaign)
        counters = threesixty_campaign.participants.
                   select('count(id) as cache_counter, relationship_id').
                   actual_by_options(threesixty_campaign.option).
                   group(:relationship_id).
                   index_by(&:relationship_id)

        render json: relationships, each_serializer: RelationshipWithUsageSerializer, counters: counters
      end

      def destroy
        form = ::Threesixty::Relationships::DestroyForm.from_params(params)
        if form.valid?
          relationship.destroy!
          render json: params[:id]
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      def update
        relationship.update!(relationship_params)
        render json: relationship,
               serializer: RelationshipWithUsageSerializer,
               counters: calc_counters_for_relationship(relationship)
      end

      def create
        relationship = Relationship.create!(campaign_id: threesixty_campaign.campaign_id, type: :campaign)
        render json: relationship,
               serializer: RelationshipWithUsageSerializer,
               counters: {}
      end

      private

      def calc_counters_for_relationship(relationship)
        Participant.
          select('count(id) as cache_counter, relationship_id').
          actual_by_options(threesixty_campaign.option).
          where(relationship_id: relationship.id).
          group(:relationship_id).
          index_by(&:relationship_id)
      end

      # Set model
      def set_resource_class
        @_resource_class ||= Relationship
      end

      def relationship
        @relationship ||= Relationship.find_by(campaign_id: threesixty_campaign.campaign_id, id: params[:id])
      end

      def relationship_params
        params.require(:relationship).permit(:name)
      end
    end
  end
end
