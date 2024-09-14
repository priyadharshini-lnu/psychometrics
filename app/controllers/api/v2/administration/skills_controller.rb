# frozen_string_literal: true

module Api
  class V2::Administration::SkillsController < Api::V2::Administration::BaseController
    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::SkillPolicy,
            context[:user],
            @model,
            [
              'index'
            ],
            { project_id: context[:client_id] }
          )
        }
      }
    end
  end
end
