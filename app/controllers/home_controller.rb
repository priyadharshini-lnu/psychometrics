# frozen_string_literal: true

class HomeController < ApplicationController
  def survey_instructions
    render layout: 'users_new'
  end

  # TODO: needs some refactoring
  def sso
    session[:sso] = {
      'assign_id' => params[:assign_id],
      'display' => params[:display],
      'return_url' => params[:return_url]
    }
    if params[:assign_id]
      assign = @current_membership.assigns.find_by(id: params[:assign_id])
      redirect_to_return_url('assessment_invalid') && return unless assign
      redirect_to_return_url('assessment_completed') && return if assign.completed?

      redirect_to(pass_assign_path(assign)) && return
    end

    redirect_to(root_path)
  end

  def assessment_completed
    redirect_to_return_url('assessment_completed')
  end

  private

  def redirect_to_return_url(type)
    return redirect_to(root_path) if session[:sso].try(:[], 'return_url').nil?

    uri = URI.parse session[:sso]['return_url']
    uri.query = uri.query.gsub('ASSESSMENT_STATUS', type) if uri.query
    redirect_to uri.to_s
  rescue URI::InvalidURIError => e
    redirect_to(root_path)
  end
end
