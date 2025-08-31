# frozen_string_literal: true

module AI
  module Utils
    class PersonalDataResolver
      private_attr_reader :user

      TEMPLATE_PATTERNS = {
        'first_name' => :first_name,
        'last_name' => :last_name,
        'email' => :email,
        'id' => :id
      }.freeze

      def initialize(user)
        @user = user
      end

      def resolve(content)
        return content if content.blank?

        resolved_content = content.dup

        # Use regex to find all {{...}} patterns and replace them
        resolved_content.gsub!(/\{\{\s*([^}]+)\s*\}\}/) do |match|
          template_key = Regexp.last_match(1).strip.downcase

          if TEMPLATE_PATTERNS.key?(template_key)
            user_attribute = TEMPLATE_PATTERNS[template_key]
            user_value = get_user_value(user_attribute)
            user_value.present? ? user_value.to_s : match
          else
            match # Keep original if not a recognized template
          end
        end

        resolved_content
      end

      def self.resolve(content, user)
        new(user).resolve(content)
      end

      private

      def get_user_value(attribute)
        return nil unless AI::Utils::PersonalDataResolver::TEMPLATE_PATTERNS.value?(attribute)
        return nil unless user.respond_to?(attribute)

        user.public_send(attribute)
      end
    end
  end
end
