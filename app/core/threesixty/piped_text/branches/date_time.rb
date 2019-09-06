# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      class DateTime < BaseBranch
        def call
          class_name = "Threesixty::PipedText::Branches::DateTimeFields::#{path.first}".safe_constantize
          broadcast :ok, class_name&.call!(path, params, context)
        end
      end
    end
  end
end
