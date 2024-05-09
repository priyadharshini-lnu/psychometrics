# frozen_string_literal: true

module Api
  class V2::Administration::SkillAliasesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::SkillAlias::Schema
    validates_request_schema :create, ::Api::V2::SkillAlias::CreateContract.new
    validates_request_schema :update, ::Api::V2::SkillAlias::UpdateContract.new
    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::SkillAliasPolicy,
            context[:user],
            @model,
            [
              'index',
              'create',
              %w[edit update],
              %w[remove destroy]
            ],
            { project_id: context[:client_id] }
          )
        }
      }
    end
  end
end
