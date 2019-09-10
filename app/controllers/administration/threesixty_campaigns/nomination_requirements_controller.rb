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
        form = ::Threesixty::NominationRequirements::SaveAllForm.from_params(params)
        if form.valid?
          ::Threesixty::NominationRequirements::SaveAll.call!(threesixty_campaign, form)
          render json: :ok
        else
          render json: :error, status: :bad_request
        end
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::NominationRequirement # rubocop:disable Naming/MemoizedInstanceVariableName
      end
    end
  end
end
