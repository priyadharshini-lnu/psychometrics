# frozen_string_literal: true

module Api
  module V2
    module Projects
      class UpdateContract < Api::V2::Projects::BaseContract
        schema Api::V2::Projects::Schema.update_request

        rule(data: { attributes: :subdomain }) do
          current_project_id = values.dig(:data, :id)
          key.failure(:uniq_subdomain) if ::Project.where.not(id: current_project_id).exists?(subdomain: value)
        end
      end
    end
  end
end
