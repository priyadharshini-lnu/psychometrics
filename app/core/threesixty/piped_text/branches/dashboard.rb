# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      class Dashboard < BaseBranch
        def call
          return broadcast :ok, '' unless path.first

          class_name = "Threesixty::PipedText::Branches::DashboardFields::#{path.first}".safe_constantize
          broadcast :ok, class_name&.call!(path, params, context)
        end
      end
    end
  end
end
