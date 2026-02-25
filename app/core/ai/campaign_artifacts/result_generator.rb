# frozen_string_literal: true

module AI
  module CampaignArtifacts
    class ResultGenerator < BaseCommand
      class ResponseError < StandardError; end

      private_attr_reader :campaign_ai_artifact, :current_user, :user, :error, :options, :artifact_parser,
                          :force_regenerate, :campaign

      def initialize(campaign_ai_artifact, user, options = {})
        @campaign_ai_artifact = campaign_ai_artifact
        @campaign = campaign_ai_artifact.campaign
        @user = user
        @error = nil
        @options = options
        @current_user = options[:current_user]
        # By default force regeneration even if dependencies haven't changed
        @force_regenerate = options.fetch(:force_regenerate, true)
        @artifact_parser = AI::Utils::CampaignArtifactParser.new(campaign_ai_artifact, user)
      end

      def call
        return broadcast(:error, 'Not enough license') unless has_enough_license?

        unless should_regenerate?
          return broadcast(:ok, {
            parsed_dependencies: parsed_dependencies,
            results: artifact_result.results
          })
        end

        unless test_mode?
          campaign_user.update!(campaign_artifact_results_finalized: false)
        end

        generate_artifact_result!

        # The generate_artifact_result! method will finish with successful completion signal
        # If it doesn't, this should be considered as an error by assistant service
        broadcast(:error, error.message, error) if error.present?
      rescue AI::Utils::SuccessfulCompletionSignal => e
        res = e.data
        add_license_usage(res)
        chat = chat_with_context.reload
        response = {
          parsed_dependencies: parsed_dependencies,
          results: res,
          input_tokens: chat.input_tokens,
          output_tokens: chat.output_tokens
        }
        broadcast(:ok, response)
      rescue AI::Utils::CampaignArtifactParser::Error, AI::Tools::Errors::MaximumRetryAttemptsExceededError => e
        handle_artifact_result_error(e)
        broadcast(:error, e.message, e)
      end

      private

      def add_license_usage(response)
        # TODO: Add license usage made by the current_user
      end

      def has_enough_license?
        # TODO: Implement license check
        true
      end

      def generate_artifact_result!
        assistant_service = AI::AssistantService.new(
          campaign_artifact_assistant.id,
          current_user,
          parsed_dependencies,
          chat: chat_with_context
        )

        assistant_service.
          on(:ok) do |assistant_response|
            # This is the case when assistant didn't choose to use tool
            # which would trigger the completion signal
            # and prompt didn't include what to do in such case
            handle_artifact_result_error(ResponseError.new(assistant_response[:message]))
          end.
          on(:error) do |_error_message, error|
            handle_artifact_result_error(error)
          end.
          call
      end

      def campaign_instructions_and_dependencies
        @campaign_instructions_and_dependencies ||= artifact_parser.call!
      end

      def parsed_dependencies
        test_data = options[:test_data] || ''

        if test_mode?
          <<~DATA
            #{artifact_parser.parse_campaign_instructions}
            <test_parsed_data>
            #{test_data}
            </test_parsed_data>
          DATA
        else
          campaign_instructions_and_dependencies
        end
      end

      def handle_artifact_result_error(error)
        unless test_mode?
          artifact_result.error = error.message
          artifact_result.save!
          campaign_artifact_assistant_chat.update!(ai_assisted_user_session_id: artifact_result.id)
        end

        @error = error
      end

      def artifact_result
        @artifact_result ||= campaign_ai_artifact.results.find_or_initialize_by(user: user)
      end

      def test_mode?
        options.fetch(:test_mode, false)
      end

      def content_writer_tools
        save_results = !test_mode?

        [AI::Tools::CampaignArtifactResultManager.new(
          campaign_ai_artifact, user,
          save_results: save_results,
          parsed_dependencies: parsed_dependencies,
          chat: campaign_artifact_assistant_chat,
          campaign_user: campaign_user
        )]
      end

      def should_regenerate?
        return true if force_regenerate

        # When we had an error in previous run, we want to run it again even if dependencies haven't changed
        has_error = artifact_result.error.present?
        has_error || dependencies_changed?
      end

      def dependencies_changed?
        schema_keys_changed = artifact_result.schema_keys_changed?
        parsed_dependencies_changed = artifact_result.parsed_dependencies != campaign_instructions_and_dependencies

        schema_keys_changed || parsed_dependencies_changed
      end

      def campaign_artifact_assistant
        @campaign_artifact_assistant ||= campaign_ai_artifact.ai_assistant
      end

      def campaign_artifact_assistant_chat
        @campaign_artifact_assistant_chat ||= campaign_artifact_assistant.for_user(current_user)
      end

      def chat_with_context
        campaign_artifact_assistant_chat.with_tools(*content_writer_tools)
      end

      def campaign_user
        # user is not present when doing test generation
        @campaign_user ||= CampaignUser.find_by(campaign_id: campaign.id, user_id: user&.id)
      end
    end
  end
end
