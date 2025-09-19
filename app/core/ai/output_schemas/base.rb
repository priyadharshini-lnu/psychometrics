# frozen_string_literal: true

module AI
  module OutputSchemas
    class Base < RubyLLM::Schema
      # Base class for all AI output schemas

      # Class method to get schema context for system prompts
      # Should be implemented by subclasses to provide specific context
      def self.as_context
        raise NotImplementedError, "#{self} must implement as_context class method"
      end
    end
  end
end
