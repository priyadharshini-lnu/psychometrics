# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class OptionsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      before_action :load_campaign_report!, only: %i[update_language report_options]
      append_before_action :pundit_authorize

      def participant_options
        render(json: threesixty_campaign.option.participants.tap do |data|
          data[:relationships] = Panko::ArraySerializer.new(
            Relationships::ByCampaign.
            new(threesixty_campaign.campaign),
            each_serializer: RelationshipSerializer
          ).to_a
        end)
      end

      def message_options
        render json: threesixty_campaign.option.messages
      end

      def report_options
        options = threesixty_campaign.option.reports
        languages = {
          report_locales: @campaign_report.report.other_languages + [@campaign_report.report.default_language],
          default_language: @campaign_report.effective_default_language,
          available_languages: @campaign_report.available_languages
        }
        options[:languages] = languages

        render json: options
      end

      def update_language
        @campaign_report.update!(language_params)

        render json: {
          status: :ok,
          data: language_params
        }
      end

      def update
        if form.valid?
          threesixty_campaign.option.update!(option_params)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Option # rubocop:disable Naming/MemoizedInstanceVariableName
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
        params.expect(option: [reports: {}, participants: {}, messages: {}])
      end

      def language_params
        params.expect(languages: [:default_language, { available_languages: [] }])
      end

      def load_campaign_report!
        @campaign_report = CampaignReport.includes(:report).find_by!(report_id: threesixty_campaign.report_id,
                                                                     campaign_id: threesixty_campaign.campaign_id)
      end
    end
  end
end
