# frozen_string_literal: true

module AI
  module Tools
    class CampaignArtifactResultManager < AI::Tools::Base
      class SchemaValidationError < StandardError; end
      interrupt_on_success_with_signal
      raise_error_on_maximum_retry
      max_retry_attempts 2

      # rubocop:disable Layout/LineLength
      description 'Tool to show all generated results against the assistant output schema to the user.'
      param :results,
            desc: 'JSON string containing the response with all keys available in assistant output schema and values. Keys in the json object should only include ALL keys available in assistant output schema. This will be parsed using JSON.parse method. e.g. {"key_name": "value", ...}'
      # rubocop:enable Layout/LineLength

      private_attr_reader :artifact, :user, :save_results, :parsed_dependencies, :masked_data_resolutions, :chat,
                          :campaign_user

      def initialize(artifact, user, context = {})
        @artifact = artifact
        @user = user
        @campaign_user = context.fetch(:campaign_user, nil)
        @save_results = context.fetch(:save_results, false)
        @parsed_dependencies = context.fetch(:parsed_dependencies, nil)
        @artifact_checksum = context.fetch(:artifact_checksum, nil)
        @masked_data_resolutions = context.fetch(:masked_data_resolutions, {}) || {}
        @chat = context.fetch(:chat, nil)
      end

      def execute(results:)
        results = JSON.parse(results)

        validated_results = validate_schema!(results)

        final_results = resolve_masked_information(validated_results)

        unless @save_results
          return final_results
        end

        @artifact.results.find_or_initialize_by(user: @user).tap do |artifact_result|
          artifact_result.results = final_results
          artifact_result.error = nil
          artifact_result.parsed_dependencies = @parsed_dependencies
          artifact_result.content_checksum = @artifact_checksum
          artifact_result.save!
          chat.update!(ai_assisted_user_session_id: artifact_result.id)
        end

        auto_finalize_campaign_artifact_result!

        final_results
      rescue ActiveRecord::RecordInvalid, ActiveRecord::StatementInvalid,
             JSON::ParserError, SchemaValidationError => e
        { error: e.message }
      end

      private

      def validate_schema!(results)
        validation_errors = @artifact.validate_results_schema(results)

        return results if validation_errors.empty?

        formatted_errors = validation_errors.map { |e| "results #{e}" }.join(', ')
        raise SchemaValidationError, "Validation failed: #{formatted_errors}"
      end

      def resolve_masked_information(results)
        results.transform_values do |content|
          if content.is_a?(String)
            AI::Utils::MaskedDataResolver.resolve(content, user, masked_data_resolutions)
          else
            content
          end
        end
      end

      def auto_finalize_campaign_artifact_result!
        campaign_user.with_lock do
          campaign_user.reload
          if campaign_user.all_campaign_artifact_results_present?
            campaign_user.update!(
              campaign_artifact_results_finalized: true,
              campaign_artifact_results_finalized_at: Time.current
            )
          end
        end
      end
    end
  end
end
