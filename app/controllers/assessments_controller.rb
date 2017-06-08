# == Schema Information
#
# Table name: assessments
#
#  id                :integer          not null, primary key
#  name              :string
#  category          :enum             default("psychometric")
#  dimension_id      :integer
#  disabled          :boolean          default(FALSE)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  flow              :json
#  norm_rules        :json
#  description       :text
#  timing            :string
#  access_reports_at :datetime
#  status            :integer
#

class AssessmentsController < ApplicationController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:pass]
  append_before_action :pundit_authorize
  layout 'users'

  def pass
    @assign = Assign.find_by!(
        assessment_id: @resource.id,
        membership_id: @current_membership.id,
        status: [:not_started, :in_progress]
    )
    @translations = ::Translation.to_hash_for_assessment(@resource.id, user_locale)
    @available_translations = ::Translation.available_translation_for_assessment(@resource.id)
    @assign.in_progress!
  end

  def index
    # in case of showing only assigned reports use:
    # reports_scope = @current_membership.reports if @current_project.end_level?
    # reports_scope ||= @current_membership.clients_reports
    @reports = Report.for_clients(@current_project.subtree_ids).enabled.available_to_view.distinct.group_by(&:assessment_id)
    @resources = policy_scope(@resource_class).enabled.order(:id).all
    render layout: 'users_new'
  end

  private

  # Set model
  def set_resource_class
    @resource_class ||= Assessment
  end

  def set_resource
    @resource = @resource_class.enabled.find(params[:id])
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
