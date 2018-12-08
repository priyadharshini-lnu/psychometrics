class Mindmill::AssignsController < ApplicationController
  before_action :set_assign
  append_before_action :pundit_authorize
  layout false

  def pass
    mindmill = Api::Mindmill.new(@assign, @current_membership, user_locale)
    mindmill.assign_user
    @ssourl = mindmill.ssourl
    redirect_back(fallback_location: root_path, error: t('errors.error_500')) && return unless @ssourl

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
  end

  def results
    mindmill = Api::Mindmill.new(@assign, @current_membership, user_locale)
    mindmill.load_results
    redirect_back(fallback_location: root_path, error: t('.not_completed')) && return unless mindmill.report
    report = "data:application/pdf;base64,#{mindmill.report}"
    @assign.update(mindmill_report: report, status: :completed, completed_at: Time.current)
    redirect_back(fallback_location: root_path, success: t('.successfully'))
  end

  private

  def set_assign
    @assign = policy_scope(Assign).where.not(status: :completed).find(params[:id])
  end

  # Authorisation user
  def pundit_authorize
    authorize @assign || Assign
  end
end
