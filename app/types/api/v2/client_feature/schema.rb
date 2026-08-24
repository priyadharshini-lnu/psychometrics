# frozen_string_literal: true

module Api
  module V2
    module ClientFeature
      class Schema < Api::Base::Schema
        def self.resource
          'client_features'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:sms_notification].maybe(:bool)
            attribute[:ai_assistants].maybe(:bool)
            attribute[:ai_assisted_idp].maybe(:bool)
            attribute[:global_skills].maybe(:bool)
            attribute[:idp].maybe(:bool)
            attribute[:ai_translation].maybe(:bool)
            attribute[:enhance_with_ai].maybe(:bool)
            attribute[:ai_content_analysis].maybe(:bool)
            attribute[:use_new_communication_center].maybe(:bool)
            attribute[:superadmin_tenant_scoping].maybe(:bool)
          end
        end
      end
    end
  end
end
