# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Projects
        class ReportResource < Api::V2::Administration::BaseResource
          attributes :name
        end
      end
    end
  end
end
