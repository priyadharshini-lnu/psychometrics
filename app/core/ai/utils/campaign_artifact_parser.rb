# frozen_string_literal: true

module AI
  module Utils
    class CampaignArtifactParser
      class Error < StandardError; end

      private_attr_reader :campaign_assistant_artifact, :user, :enable_masking_pii

      delegate :masked_data_resolutions, to: :user_data_parser

      def initialize(campaign_assistant_artifact, user, enable_masking_pii: false)
        @campaign_assistant_artifact = campaign_assistant_artifact
        @user = user
        @enable_masking_pii = enable_masking_pii
      end

      def call!
        parse_artifact
      end

      def parse_campaign_instructions
        instructions = @campaign_assistant_artifact.instructions || ''
        "<campaign_instructions>\n#{instructions}\n</campaign_instructions>\n"
      end

      private

      def parse_artifact_context
        <<~CONTEXT
          #{parse_campaign_instructions}
          #{parsed_user_data}
        CONTEXT
      end

      def parsed_user_data
        user_data_parser.parse
      end

      def user_data_parser
        @user_data_parser ||= DependencyParser::UserData.new(user, enable_masking_pii: enable_masking_pii)
      end

      def parse_artifact
        "#{parse_artifact_context}" \
          "#{parse_artifact_dependencies}\n"
      end

      def campaign
        @campaign ||= @campaign_assistant_artifact.campaign
      end

      def parse_artifact_dependencies
        dependency_errors = []
        dependency_outputs = []

        dependencies.each do |dependency|
          output = DependencyParser.parse(dependency, campaign_assistant_artifact, user)
          dependency_outputs << output
        rescue DependencyParser::Error => e
          dependency_errors << e.message
        end

        # If there are any errors, raise them all together
        if dependency_errors.any?
          error_message = "Parsing error:\n#{dependency_errors.join("\n")}"
          raise Error, error_message
        end

        dependency_outputs.join("\n")
      end

      def dependencies
        @dependencies ||= campaign_assistant_artifact.ai_assistant.dependencies || []
      end
    end
  end
end
