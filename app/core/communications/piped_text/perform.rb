# frozen_string_literal: true

module Communications
  module PipedText
    class Perform < ::PipedText::BasePerform
      def self.branches
        [
          {
            key: 'c',
            name: 'campaign',
            class_name: 'Communications::PipedText::Branches::Campaign',
            required_context: %i[user],
            allow_html: true
          },
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
          },
          {
            key: 'u',
            name: 'user',
            class_name: 'Communications::PipedText::Branches::User',
            required_context: %i[user],
            allow_html: true
          },
          {
            key: 'pl',
            name: 'PlatformUrlAndLinks',
            class_name: 'Communications::PipedText::Branches::PlatformUrlAndLinks',
            required_context: %i[campaign],
            allow_html: true
          },
          {
            key: 'ur',
            name: 'UserReport',
            class_name: 'Communications::PipedText::Branches::UserReport',
            required_context: %i[user_report]
          },
          {
            key: 'p',
            name: 'Project',
            class_name: 'Communications::PipedText::Branches::Project',
            required_context: %i[campaign],
            allow_html: true
          }
        ].freeze
      end

      def self.piped_text_regex
        /\${(.*?)}/
      end
    end
  end
end
