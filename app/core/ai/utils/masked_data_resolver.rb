# frozen_string_literal: true

module AI
  module Utils
    class MaskedDataResolver
      private_attr_reader :user, :resolution_mapping

      def initialize(user, resolution_mapping = {})
        @user = user
        @resolution_mapping = resolution_mapping
      end

      def resolve(content)
        return content if content.blank?

        resolved_content = content.dup

        resolution_mapping.each do |masked_value, actual_value|
          resolved_content.gsub!(masked_value, actual_value)
        end

        resolved_content
      end

      def self.resolve(content, user, resolution_mapping = {})
        new(user, resolution_mapping).resolve(content)
      end
    end
  end
end
