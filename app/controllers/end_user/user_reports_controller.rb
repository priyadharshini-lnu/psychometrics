# frozen_string_literal: true

class EndUser::UserReportsController < ApplicationController
  include UserReports::PdfGeneration

  private

  def resource
    @resource ||= current_user.user_reports.find(params[:id])
  end
end
