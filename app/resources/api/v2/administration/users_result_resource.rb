# frozen_string_literal: true

class Api::V2::Administration::UsersResultResource < Api::V2::Administration::BaseResource
  attributes :answers, :scoring, :external_results

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::UsersResultPolicy,
          context[:user],
          @model,
          [
            'show'
          ]
        )
      }
    }
  end
end
