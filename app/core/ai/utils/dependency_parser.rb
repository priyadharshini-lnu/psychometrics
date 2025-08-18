# frozen_string_literal: true

module AI
  module Utils
    module DependencyParser
      PARSERS = {
        'datasheet' => DependencyParser::Datasheet,
        'assessments' => DependencyParser::Assessment,
        'campaign_factors' => DependencyParser::CampaignFactor
      }.freeze

      def self.parse(dependency, campaign_assistant_artifact, user)
        parser_class = PARSERS[dependency]

        unless parser_class
          raise DependencyParser::DependencyNotConfiguredError, dependency
        end

        parser_class.new(campaign_assistant_artifact, user).parse
      rescue DependencyParser::Error => e
        raise e
      rescue StandardError => e
        # Wrap unexpected errors in a dependency error
        raise DependencyParser::Error.new(dependency.split('_').map(&:capitalize).join(' '),
                                          ["Unexpected error: #{e.message}"])
      end
    end
  end
end
