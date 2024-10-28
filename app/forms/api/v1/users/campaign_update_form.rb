# frozen_string_literal: true

module Api
  module V1
    module Users
      class CampaignUpdateForm < Rectify::Form
        attribute %i[schedule_start_date schedule_end_date], DateTime

        validates_datetime :schedule_start_date, allow_blank: true
        validates_datetime :schedule_end_date, allow_blank: true
      end
    end
  end
end
