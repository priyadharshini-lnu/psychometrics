# frozen_string_literal: true

module Api
  module V2
    module JobRole
      class Schema < Api::Base::Schema
        def self.resource
          'job_roles'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:name].filled(:string)
            attribute[:code].filled(:string)
            attribute[:description].filled(:string)
            attribute[:job_group_id].filled(:integer)
            optional(:project_id).maybe(:integer)
          end
        end
      end
    end
  end
end
