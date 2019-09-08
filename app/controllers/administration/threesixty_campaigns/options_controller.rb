# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class OptionsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      append_before_action :pundit_authorize

      def participant_options
        render(json: threesixty_campaign.option.participants.tap do |data|
          data[:relationships] = Relationships::ByCampaign.new(threesixty_campaign.campaign).map { |r| RelationshipSerializer.new(r).to_h }
        end)
      end

      def message_options
        render json: threesixty_campaign.option.messages
      end

      def report_options
        render json: threesixty_campaign.option.reports
      end

      def update
        if form.valid?
          threesixty_campaign.option.update!(option_params)
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

      def form
        @form ||=
          if params[:participants]
            ::Threesixty::Options::ParticipantOptionForm.
              from_params(params[:participants]).
              with_context(datasheet_column_names: threesixty_campaign.datasheet_column_names)
          elsif params[:reports]
            ::Threesixty::Options::ReportOptionForm.from_params(params[:reports])
          elsif params[:messages]
            ::Threesixty::Options::MessageOptionForm.from_params(params[:messages])
          end
      end

      def option_params
        params.require(:option).permit(reports: {}, participants: {}, messages: {})
      end
    end
  end
end
