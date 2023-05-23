# frozen_string_literal: true

module Api
  module V2
    module Projects
      class CreateContract < Api::V2::Projects::BaseContract
        schema Api::V2::Projects::Schema.create_request

        rule(data: { attributes: :subdomain }) do
          key.failure(:uniq_subdomain) if ::Project.exists?(subdomain: value)
        end
      end
    end
  end
end
