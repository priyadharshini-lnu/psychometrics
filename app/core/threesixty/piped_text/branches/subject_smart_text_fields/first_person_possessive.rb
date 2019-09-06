# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module SubjectSmartTextFields
        class FirstPersonPossessive < BaseField
          def call
            result =
              if context[:subject].id == context[:evaluator].id
                I18n.t('my')
              else
                context[:subject].decorate.full_name.possessive
              end
            broadcast :ok, result
          end
        end
      end
    end
  end
end
