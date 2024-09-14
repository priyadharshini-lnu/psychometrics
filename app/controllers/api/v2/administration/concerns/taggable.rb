# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Concerns
        module Taggable
          extend ActiveSupport::Concern

          def add_tag
            resource.add_tag(tag)
            save_resource_and_render
          end

          def remove_tag
            resource.remove_tag(tag)
            save_resource_and_render
          end

          private

          def tag
            params.dig(:data, :attributes, :tag)
          end

          def save_resource_and_render
            if resource.save
              jsonapi_render json: resource
            else
              jsonapi_render_errors resource.errors
            end
          end
        end
      end
    end
  end
end
