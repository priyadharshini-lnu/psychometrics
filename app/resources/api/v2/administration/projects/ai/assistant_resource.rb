# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Projects
        class AI::AssistantResource < BaseResource
          model_name 'AI::Assistant'
          attributes :name

          ransack_filters %i[filterable_fields assistant_type_eq]
        end
      end
    end
  end
end
