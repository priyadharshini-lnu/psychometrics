# frozen_string_literal: true

module Api
  module V2
    module Administration
      class SkillsJobRolesController < Api::V2::Administration::BaseController
        skip_before_action :enforce_geo_restriction
        validates_request_schema :create, lambda {
          SkillsJobRole::Contract.new(schema: SkillsJobRole::Schema.create_request)
        }
        validates_request_schema :update, lambda {
          SkillsJobRole::Contract.new(schema: SkillsJobRole::Schema.update_request)
        }
        validate_crud_requests SkillsJobRole::Schema

        def meta_details
          {
            permissions: lambda {
              GetPermissionsHash.call!(
                ::Api::Administration::SkillsJobRolePolicy,
                context[:user],
                @model,
                %w[
                  index
                  create
                  update
                  destroy
                ],
                { project_id: project_id }
              )
            }
          }
        end

        def context
          super.merge(
            filter: params[:filter]
          )
        end
      end
    end
  end
end
