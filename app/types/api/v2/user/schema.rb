# frozen_string_literal: true

module Api
  module V2
    module User
      class Schema < Api::Base::Schema
        def self.resource
          'users'
        end

        def self.attributes(attribute, type)
          if type == :create
            create_attributes(attribute)
          else
            base_attributes(attribute)
          end
        end

        def self.create_attributes(attribute)
          proc do
            attribute[:email].filled(:string)
            attribute[:first_name].filled(:string)
            attribute[:last_name].filled(:string)
          end
        end

        def self.base_attributes(attribute)
          proc do
            attribute[:email].filled(:string)
            attribute[:name].filled(:string)
            attribute[:full_name].filled(:string)
            attribute[:first_name].filled(:string)
            attribute[:last_name].filled(:string)
            optional(:updated_at).filled(:string)
            attribute[:disabled].filled(:bool)
            attribute[:enable_2fa].filled(:bool)
            optional(:created_by).maybe(:string)
            optional(:modified_by).maybe(:string)
            attribute[:role].filled(:string)
          end
        end
      end
    end
  end
end
