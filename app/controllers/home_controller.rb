class HomeController < ApplicationController
  def survey_instructions
    render layout: 'users_new'
  end

  # TODO: needs some refactoring
  def sso
    if params[:return_url] && !params[:assign_id]
      redirect_to_return_url('assessment_invalid') && return
    end
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
    return redirect_to(root_path) if params[:return_url].blank?

    uri = URI.parse params[:return_url]
    uri.query = uri.query.gsub('ASSESSMENT_STATUS', type) unless uri.query.nil?
    redirect_to uri.to_s
  end
end
