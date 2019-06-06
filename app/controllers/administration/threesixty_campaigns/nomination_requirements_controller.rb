# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class NominationRequirementsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      append_before_action :pundit_authorize

      def index
        render(
          json: policy_scope(::Threesixty::NominationRequirement).
                where(threesixty_campaign_id: threesixty_campaign.id).
                order(:position),
          each_serializer: NominationRequirementSerializer
        )
      end

      def save
        ::Threesixty::NominationRequirements::Save.call!(
          threesixty_campaign,
          params[:nomination_requirements]
        )
        render json: :ok
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::NominationRequirement
      end
    end
  end
end
