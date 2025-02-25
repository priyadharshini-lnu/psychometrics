# frozen_string_literal: true

module Api
  module V2
    module IdpSetting
      class UpdateContract < Api::Base::Contract
        schema Api::V2::IdpSetting::Schema.update_request

        rule(data: { attributes: :allow_global_skills }) do
          unless Api::Administration::IdpSettingPolicy.new(_context[:current_user], _context[:idp_setting]).
                 manage_global_skills?
            key.failure(:not_allowed?)
          end
        end
      end
    end
  end
end
