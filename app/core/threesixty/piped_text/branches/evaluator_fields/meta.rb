# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module EvaluatorFields
        class Meta < RecipientFields::Meta
          protected

          def user
            context[:evaluator]
          end
        end
      end
    end
  end
end
