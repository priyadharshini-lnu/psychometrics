# == Schema Information
#
# Table name: assessments
#
#  id           :integer          not null, primary key
#  name         :string
#  category     :enum             default("psychometric")
#  dimension_id :integer
#  disabled     :boolean          default(FALSE)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  flow         :json
#  norm_rules   :json
#  description  :text
#

class AssessmentsController < ApplicationController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:pass]
  append_before_action :pundit_authorize
  layout 'users'

  def pass
    @assign = Assign.find_by(
      assessment_id: @resource.id,
      membership_id: @current_membership.id
    )
    @assign.update(status: Assign.statuses['in_progress'], step: 0)
  end

  def index
    @reports = @current_client.reports.available_to_view.group_by(&:assessment_id)
    @resources = policy_scope(@resource_class).order(:id).all
  end

  private

  # Set model
  def set_resource_class
    @resource_class ||= Assessment
  end

  def set_resource
    @resource = @resource_class.find(params[:id])
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
