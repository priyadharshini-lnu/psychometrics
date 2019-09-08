# frozen_string_literal: true

class Mindmill::AssignsController < ApplicationController
  before_action :set_assign
  append_before_action :pundit_authorize
  layout false

  def pass
    redirect_back(fallback_location: root_path, success: t('mindmill.assigns.results.successfully')) && return if @assign.completed?
    mindmill = Api::Mindmill.new(@assign, @current_membership, user_locale)
    mindmill.assign_user
    redirect_back(fallback_location: root_path, error: t('errors.error_500')) && return unless mindmill.ssourl
    @ssourl = "#{mindmill.ssourl}&URL=#{request.base_url + results_mindmill_assign_path(@assign)}"

    @assign.in_progress!
    BuildMindmillResultsJob.set(wait: 1.hour).perform_later(@assign, @current_membership, user_locale)
    # Set Not Started for all Mindmill assigns, except current
    # Cause only one Mindmill can has In Progress status
    Assign.
      in_progress.
      mindmill.
      where(membership_id: @current_membership.id).
      where.not(id: @assign.id).
      update_all(status: :not_started)
    redirect_to @ssourl
  end

  def results
    redirect_to(root_path, success: t('.successfully')) && return if @assign.completed?
    mindmill = Api::Mindmill.new(@assign, @current_membership, user_locale)
    mindmill.load_scores
    mindmill.load_results
    redirect_to(root_path, error: t('.not_completed')) && return unless mindmill.report && mindmill.scores
    report = "data:application/pdf;base64,#{mindmill.report}"
    normalised_scores = Imports::External::BaseExternalImport.build(:mindmill).process(mindmill.scores, @assign)
    @assign.update(mindmill_report: report, external_results: normalised_scores, status: :completed, completed_at: Time.current)
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
