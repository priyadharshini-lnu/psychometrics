# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      class Project < ::PipedText::BaseBranch
        def call
          class_name = "Communications::PipedText::Branches::ProjectFields::#{path.last}".safe_constantize
          broadcast :ok, class_name&.call!(path, params, context)
        end
      end
    end
  end
end
