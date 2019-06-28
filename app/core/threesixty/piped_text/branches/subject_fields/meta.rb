# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module SubjectFields
        class Meta < RecipientFields::Meta
          protected

          def user
            context[:subject]
          end
        end
      end
    end
  end
end
