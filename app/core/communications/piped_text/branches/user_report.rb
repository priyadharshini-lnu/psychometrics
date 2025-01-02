# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      class UserReport < ::PipedText::BaseBranch
        def call
          class_name = "Communications::PipedText::Branches::UserReportFields::#{path.second}".safe_constantize
          broadcast :ok, class_name&.call!(path, params, context)
        end
      end
    end
  end
end
