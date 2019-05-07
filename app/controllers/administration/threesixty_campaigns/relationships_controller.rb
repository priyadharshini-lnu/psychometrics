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

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Evaluator
      end
    end
  end
end
