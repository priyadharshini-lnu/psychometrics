# frozen_string_literal: true

module Communications
  module PipedText
    class Perform < ::PipedText::BasePerform
      def self.branches
        [
          {
            key: 'w',
            name: 'workshop',
            class_name: 'Communications::PipedText::Branches::Workshop',
            required_context: %i[workshop]
          },
          {
            key: 'wi',
            name: 'workshop_invite',
            class_name: 'Communications::PipedText::Branches::WorkshopInvite',
            required_context: %i[workshop_invite]
          }
        ].freeze
      end

      def self.piped_text_regex
        /\${(.*?)}/
      end
    end
  end
end
