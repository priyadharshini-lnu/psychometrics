# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class OptionsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      append_before_action :pundit_authorize

      def participation_options
        render json: threesixty_campaign.option.participants
      end

      def update
        participant_options = ::Threesixty::Options::ParticipationOptionForm.from_params(params[:participants])
        if participant_options.valid?
          threesixty_campaign.option.update!(participants: participant_options.attributes)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Option
      end
    end
  end
end
