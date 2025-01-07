# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      class PlatformUrlAndLinks < ::PipedText::BaseBranch
        def call
          class_name = "Communications::PipedText::Branches::PlatformUrlAndLinksFields::#{path.second}".safe_constantize
          broadcast :ok, class_name&.call!(path, params, context)
        end
      end
    end
  end
end
