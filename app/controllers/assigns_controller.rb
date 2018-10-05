# == Schema Information
#
# Table name: assigns
#
#  id            :integer          not null, primary key
#  assessment_id :integer
#  results       :jsonb
#  scoring       :jsonb
#  embedded_data :jsonb
#  status        :integer          default("not_started")
#  role          :integer          default("member")
#  completed_at  :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  step          :integer
#  membership_id :integer
#  norm_data     :jsonb
#  agile_scoring :jsonb
#  started_at    :datetime
#

class AssignsController < ApplicationController
  layout 'users_new'

  before_action :set_assign, only: %i(pass update)
  append_before_action :pundit_authorize

  # Skip CSRF
  skip_before_action :verify_authenticity_token, only: %i(update)

  def index
    @reports_ids = Report.for_clients(@current_project.subtree_ids).enabled.available_to_view.distinct.ids
    @single_assigns = policy_scope(Assign).preload(:assessment).
      includes(:single_reports, original_assign: [:single_reports])

    multiple_reports_ids =  multiple_reports_ids(@reports_ids)
    multiple_assigns_reports = multiple_assigns_reports(current_user, @current_project, multiple_reports_ids)

    @multiple_reports = multiple_reports(multiple_assigns_reports)

    @current_membership.set_user_invited_for_current_project
  end

  def pass
    @assign.in_progress!
    @available_translations = ::Translation.available_translation_for_assessment(@assign.assessment_id)
    if params[:lang] && (@available_translations + [I18n.default_locale.to_s]).include?(params[:lang])
      @assign.update(selected_locale: params[:lang])
    end
    @selected_locale = @assign.selected_locale || user_locale
    @translations = ::Translation.to_hash_for_assessment(@assign.assessment_id, @selected_locale)
  end

  def update
    @assign.assign_attributes(resource_params)
    @assign.step += 1
    if @assign.completed?
      @assign.calculate_scoring
      @assign.completed_at = Time.now
    end
    @assign.save
    head :no_content
  end

  private

  def set_assign
    @assign = policy_scope(Assign).where.not(status: :completed).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to(action: :index)
  end

  def resource_params
    results = params.require(:resource).fetch(:results, nil).try(:permit!)
    embedded_data = params.require(:resource).fetch(:embedded_data, nil).try(:permit!)
    norm_data = params.require(:resource).fetch(:norm, nil).try(:permit!)
    params.require(:resource).permit(:step, :status).merge(results: results, embedded_data: embedded_data, norm_data: norm_data)
  end

  # Authorisation user
  def pundit_authorize
    authorize @assign || Assign
  end

  def multiple_reports(assigns_reports)
    assigns_reports.group_by(&:report_id).map do |report_id, group|
      Facades::Assigns::MultipleReport.new(report_id, group, pundit_user)
    end
  end

  def multiple_assigns_reports(user, project, report_ids)
    AssignsReport.includes(assign: [:membership, :project_assign]).
      where(assigns: { memberships: { user_id: user.id, client_id: project.subtree_ids } }).
      where(report_id: report_ids)
  end

  def multiple_reports_ids(reports_ids)
    Report.multiple.where(id: reports_ids).ids
  end
end
