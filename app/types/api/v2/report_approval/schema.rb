# frozen_string_literal: true

module Api
  module V2
    module ReportApproval
      class Schema < Api::Base::Schema
        def self.resource
          'report_approvals'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:approval_status].filled(:string)
            attribute[:qc_user_ids].array(:integer)
            attribute[:approver_user_ids].array(:integer)
          end
        end

        def self.relationships(_)
          [
            { name: :campaign, resource: :campaigns, relationship: :one },
            { name: :report, resource: :reports, relationship: :one }
          ]
        end
      end
    end
  end
end
