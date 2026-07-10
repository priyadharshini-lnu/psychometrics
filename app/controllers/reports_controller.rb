# frozen_string_literal: true

# TODO: Investigate possibility to remove
# Cause user no more need to view report
class ReportsController < ApplicationController
  include AuthenticateByToken
  include AddCookie

  # Turn off normally auth
  skip_before_action :authenticate_user!
  # Turn on auth by token
  prepend_before_action :authenticate_by_token!

  # Issue #122
  # Extract the export functionality to a new method
  # cause export flow must pass without obstacles
  #
  def export
    @resource = Report.enabled.includes(pages: [:modules]).find(params[:id])
    pundit_authorize
    prepare_data
    render('_show', layout: 'pdf')
  end

  private

  # Authorisation user
  def pundit_authorize
    authorize @resource || Report
  end

  def add_cookie_for_file_download
    add_cookie(:fileDownload, true, httponly: false)
  end
end
