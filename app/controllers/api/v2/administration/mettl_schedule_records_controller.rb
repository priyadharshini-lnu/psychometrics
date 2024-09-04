# frozen_string_literal: true

module Api
  class V2::Administration::MettlScheduleRecordsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::MettlScheduleRecord::Schema

    def context
      super.merge(
        project_id: params[:project_id]
      )
    end
  end
end
