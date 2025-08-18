# frozen_string_literal: true

require_relative 'error'

module AI
  module Utils
    module DependencyParser
      class Base
        private_attr_reader :campaign_assistant_artifact, :user

        def initialize(campaign_assistant_artifact, user)
          @campaign_assistant_artifact = campaign_assistant_artifact
          @user = user
          @errors = []
        end

        def parse
          raise NotImplementedError, "#{self.class} must implement #parse"
        end

        protected

        def add_error(message)
          @errors << message
        end

        def has_errors?
          @errors.any?
        end

        def raise_errors_if_any(dependency_name)
          return unless has_errors?

          raise DependencyValueMissingError.new(dependency_name, @errors)
        end

        def ensure_dependency_configured!(dependency:, condition:, error_message: nil)
          return if condition

          message = error_message || I18n.t(
            'administration.ai_assistants.artifacts.parsers.base.dependency_not_configured', dependency: dependency
          )
          raise DependencyNotConfiguredError.new(dependency, [message])
        end

        private

        def campaign
          @campaign ||= @campaign_assistant_artifact.campaign
        end
      end
    end
  end
end
