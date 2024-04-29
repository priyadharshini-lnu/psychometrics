# frozen_string_literal: true

module Api
  module V2
    module UserIdpPlan
      class Schema < Api::Base::Schema
        def self.resource
          'user_idp_plans'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:user_id].filled(:string)
            attribute[:idp_template_id].filled(:string)
            attribute[:campaign_id].filled(:string)
            attribute[:creator_id].filled(:string)
          end
        end
      end
    end
  end
end
