# frozen_string_literal: true

module Api
  class V2::Administration::DatasheetRowsController < Api::V2::Administration::BaseController
    def datasheet_for_assessor
      campaign = Campaign.find(params[:filter][:campaign_id])
      datasheet_columns = Sheets::GetColumns.call!(campaign.datasheet, by_access: :assessor)
      user = User.find(params[:filter][:user_id])
      unless Users::GetLeadAssessor.call!(campaign, user) == current_user
        raise Pundit::NotAuthorizedError, "You are not authorized to access datasheet for user with id: #{user.id}"
      end

      datasheet = campaign.datasheet_data(user.email)
      filtered_data = datasheet&.slice(*datasheet_columns.map(&:name))
      render json: filtered_data
    end
  end
end
