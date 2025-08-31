# frozen_string_literal: true

module AI
  module Utils
    module DependencyParser
      class Error < StandardError
        attr_reader :dependency_name, :errors

        def initialize(dependency_name, errors = [])
          @dependency_name = dependency_name
          @errors = Array(errors)
          super(build_message)
        end

        def add_error(error_message)
          @errors << error_message
        end

        private

        def build_message
          if @errors.empty?
            "Dependency '#{@dependency_name}' is not configured or available"
          else
            "Dependency '#{@dependency_name}' has the following issues:\n" +
              @errors.map { |error| "  - #{error}" }.join("\n")
          end
        end
      end

      class DependencyNotConfiguredError < Error
        def initialize(dependency_name, errors = [])
          default_errors = if errors.empty?
                             ["#{dependency_name} dependency is not configured for this campaign"]
                           else
                             errors
                           end
          super(dependency_name, default_errors)
        end
      end

      class DependencyValueMissingError < Error
        def initialize(dependency_name, missing_items = [])
          super
        end
      end
    end
  end
end
