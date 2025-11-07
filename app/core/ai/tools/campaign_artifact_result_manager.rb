# frozen_string_literal: true

module AI
  module Tools
    class CampaignArtifactResultManager < AI::Tools::Base
      interrupt_on_success_with_signal
      raise_error_on_maximum_retry
      max_retry_attempts 2

      # rubocop:disable Layout/LineLength
      description 'Tool to show all generated results against the assistant output schema to the user.'
      param :results,
            desc: 'JSON string containing the response with all keys available in assistant output schema and values. Keys in the json object should only include ALL keys available in assistant output schema. This will be parsed using JSON.parse method. e.g. {"key_name": "value", ...}'
      # rubocop:enable Layout/LineLength

      private_attr_reader :artifact, :user, :save_results, :parsed_dependencies, :masked_data_resolutions, :chat

      def initialize(artifact, user, context = {})
        @artifact = artifact
        @user = user
        @save_results = context.fetch(:save_results, false)
        @parsed_dependencies = context.fetch(:parsed_dependencies, nil)
        @masked_data_resolutions = context.fetch(:masked_data_resolutions, {}) || {}
        @chat = context.fetch(:chat, nil)
      end

      def execute(results:)
        results = JSON.parse(results)

        validated_results = validate_schema(results)

        final_results = resolve_masked_information(validated_results)

        unless @save_results
          return final_results
        end

        @artifact.results.find_or_initialize_by(user: @user).tap do |artifact_result|
          artifact_result.results = final_results
          artifact_result.ai_assistant_chat = chat
          artifact_result.parsed_dependencies = @parsed_dependencies
          artifact_result.save!
        end

        final_results
      rescue ActiveRecord::RecordInvalid, ActiveRecord::StatementInvalid,
             JSON::ParserError => e
        { error: e.message }
      end

      private

      def validate_schema(results)
        validation_errors = @artifact.validate_results_schema(results)

        return { error: validation_errors } if validation_errors.any?

        results
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
    end
  end
end
