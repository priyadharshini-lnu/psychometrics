# frozen_string_literal: true

module Users
  class CreateOrModifyGlobalAssessor < BaseCommand
    def initialize(current_user, resource_params)
      @current_user = current_user
      @create_resource_params = resource_params
    end

    def call
      user = find_or_create_user
      user.save!
      broadcast :ok, user
    end

    private

    def find_or_create_user
      user = User.find_by(email: @create_resource_params[:email], project_id: nil)
      if user.nil?
        user = User.new(@create_resource_params)
        user.modified_by_id = @current_user.id
        user.global_assessor = true
        user.created_by_id = @current_user.id
        user.create_by_invite = true
        user.invite!(@current_user)
        user.role = User::ADMIN_ROLE
      else
        user.assign_attributes(@create_resource_params)
        user.modified_by_id = @current_user.id
        user.global_assessor = true
      end
      user
    end
  end
end
