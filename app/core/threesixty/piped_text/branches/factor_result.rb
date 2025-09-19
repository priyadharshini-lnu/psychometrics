# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      class FactorResult < ::PipedText::BaseBranch
        def call
          class_name = "Threesixty::PipedText::Branches::FactorResultFields::#{path.first}".safe_constantize
          broadcast :ok, class_name&.call!(path, params, context)
        end
      end
    end
  end
end
