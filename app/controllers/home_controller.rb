class HomeController < ApplicationController
  def survey_instructions
    render layout: 'users_new'
  end

  # TODO: needs some refactoring
  def sso
    if params[:assign_id]
      assign = @current_membership.assigns.find_by(id: params[:assign_id])
      redirect_to_return_url('assessment_invalid') && return unless assign
      redirect_to_return_url('assessment_completed') && return if assign.completed?

      redirect_to(pass_assign_path(assign)) && return
    end

    redirect_to(root_path)
  end

  private

  def redirect_to_return_url(type)
    return redirect_to(root_path) if params[:return_url].blank?

    uri = URI.parse params[:return_url]
    uri.query = [uri.query, "status=#{type}"].compact.join('&')
    redirect_to uri.to_s
  end
end
