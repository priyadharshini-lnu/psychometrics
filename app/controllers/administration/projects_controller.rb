# frozen_string_literal: true

module Administration
  class ProjectsController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource
    append_before_action :pundit_authorize

    def search_users
      users = ::Projects::UsersQuery.new(resource, params[:q]).to_a.map do |user|
        ::Projects::SearchUserSerializer.new(user).to_h
      end
      render json: users
    end

    private

    def set_resource_class
      @_resource_class ||= Client # rubocop:disable Naming/MemoizedInstanceVariableName
    end
  end
end
