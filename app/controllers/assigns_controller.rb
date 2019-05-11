# frozen_string_literal: true

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
  before_action :set_assign, only: %i[pass update]
  append_before_action :pundit_authorize

  # Skip CSRF
  skip_before_action :verify_authenticity_token, only: %i[update]

  def index
    @assigns = policy_scope(Assign).
               preload(:assessment, original_assigns_reports: :report).
               joining { original_assign.outer.membership.outer.client.outer }.
               joins('LEFT OUTER JOIN "assessments_clients" ON "assessments_clients"."client_id" = "clients"."id" AND "assessments_clients"."assessment_id" = "assigns"."assessment_id"').
               order('assessments_clients.position ASC')

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
    @form = AssignForm.from_params(params[:resource])
    UpdateAssign.call(@form, @assign, current_user)

    head :no_content
  end

  def accept_privacy
    @current_membership.privacy_consents.create!
    render json: { status: :ok }
  end

  private

  def set_assign
    @assign = policy_scope(Assign).where.not(status: :completed).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to(action: :index)
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
    AssignsReport.includes(assign: %i[membership project_assign]).
                  where(assigns: { memberships: { user_id: user.id, client_id: project.subtree_ids } }).
                  where(report_id: report_ids)
  end

  def multiple_reports_ids(reports_ids)
    Report.multiple.where(id: reports_ids).ids
  end
end
