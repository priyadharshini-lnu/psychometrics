# frozen_string_literal: true

class Mindmill::AssignsController < ApplicationController
  before_action :set_assign
  append_before_action :pundit_authorize
  layout false

  def pass
    if @assign.completed?
      redirect_back(fallback_location: root_path, success: t('mindmill.assigns.results.successfully')) && return
    end
    mindmill = Api::Mindmill.new(@assign, @current_membership, user_locale)
    mindmill.assign_user
    redirect_back(fallback_location: root_path, error: t('errors.error_500')) && return unless mindmill.ssourl
    @ssourl = "#{mindmill.ssourl}&URL=#{request.base_url + results_mindmill_assign_path(@assign)}"

    @assign.in_progress!
    BuildMindmillResultsJob.perform_now(@assign, @current_membership, user_locale)
    redirect_to @ssourl
  end

  def redirect
    redirect_to(root_path, success: t('.successfully')) && return if @assign.completed?
    BuildMindmillResultsJob.perform_now(@assign, @current_membership, user_locale)
    Assigns::GenerateReport.call(@assign, current_user)
    redirect_to(root_path, success: t('.successfully'))
  end

  private

  def set_assign
    @assign = policy_scope(Assign).find(params[:id])
  end

  # Authorisation user
  def pundit_authorize
    authorize @assign || Assign
  end
end
