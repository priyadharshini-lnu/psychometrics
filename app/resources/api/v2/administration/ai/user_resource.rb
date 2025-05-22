# frozen_string_literal: true

module Api
  module V2
    module Administration
      module AI
        class UserResource < ::Api::V2::Administration::UserResource
          # This resource exists solely to satisfy the JSONAPI routing system
          # which requires namespace-matching resources for relationships
        end
      end
    end
  end
end
