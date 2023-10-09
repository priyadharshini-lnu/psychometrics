# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      class WorkshopInvite < ::PipedText::BaseBranch
        def call
          class_name = "Communications::PipedText::Branches::WorkshopInviteFields::#{path.second}".safe_constantize
          broadcast :ok, class_name&.call!(path, params, context)
        end
      end
    end
  end
end
