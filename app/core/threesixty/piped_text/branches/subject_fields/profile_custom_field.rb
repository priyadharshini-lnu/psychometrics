# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module SubjectFields
        class ProfileCustomField < ::PipedText::BaseField
          def call
            field = context[:campaign].project.profile_setting.questions.find_by(name: path.last)
            return unless field

            value = user.user_profile.custom_fields&.dig(field.id)
            broadcast :ok, value
          end

          def user
            context[:subject]
          end
        end
      end
    end
  end
end
