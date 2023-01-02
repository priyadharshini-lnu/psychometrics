# frozen_string_literal: true

module Api
  module V2
    module UserReportComment
      class Schema < Api::Base::Schema
        def self.resource
          'user_report_comments'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:text].filled(:string)
          end
        end

        def self.relationships(type)
          relations = [
            { name: :reports_module, resource: :modules, relationship: :one },
            { name: :parent, resource: :user_report_comments, relationship: :one, required: false, allowed_blank: true }
          ]
          if type == :multiple_response
            relations.push({ name: :replies, resource: :user_report_comments, relationship: :many, required: false })
          end
          relations
        end
      end
    end
  end
end
