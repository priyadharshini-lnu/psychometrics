
class InvitesController < ApplicationController
  prepend_before_action :set_resource_class
  before_action :set_assessment
  append_before_action :pundit_authorize

  layout false

  def new
    @resource = @resource_class.new
  end

  def create
    @resource = @resource_class.new(invite_params)
    if @resource.valid?
      @resource.parsed_emails.each do |email|
        invite_user(email)
      end
    else
      render :new
    end
  end

  private

  def invite_user(email)
    user = User.find_or_initialize_by(email: email)
    if user.new_record?
      user.assign_attributes({
        operator: current_user,
        role: 'Users::Member',
        memberships_attributes: [{
          client_id: @current_client.id
        }]
      })
      user.save
      user.invite!(current_user)
    end
    membership = user.memberships.find_or_create_by(client_id: @current_client.id)
    Assign.create!(membership: membership, assessment: @assessment)
  end

  # Set model
  def set_resource_class
    @resource_class ||= InviteForm
  end

  def set_assessment
    @assessment = policy_scope(Assessment).enabled.find(params[:assessment_id])
  end

  def invite_params
    params.require(:resource).permit(:emails)
  end

  # Authorisation user
  def pundit_authorize
    authorize :invite
  end
end
