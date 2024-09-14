# frozen_string_literal: true

class EndUser::JobRolesController < ApplicationController
  def index
    job_roles = ::JobRole.ransack(params[:filters]).result.limit(10)

    render json: ::Panko::ArraySerializer.new(
      job_roles,
      each_serializer: ::EndUser::JobRoleSerializer
    ).to_a
  end
end
