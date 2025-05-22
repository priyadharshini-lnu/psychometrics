# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Clients
        class ReportResource < Api::V2::Administration::BaseResource
          attributes :name

          ransack_filters %i[name_cont id_eq]

          def self.records(opts = {})
            Api::Administration::Clients::ReportPolicy::Scope.new(
              opts[:context][:user],
              ::Report,
              project_id: opts[:context][:params]['client_id']
            ).resolve
          end
        end
      end
    end
  end
end
