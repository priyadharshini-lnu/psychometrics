# frozen_string_literal: true

class Assessors::UsersController < Administration::BaseController
  skip_after_action :verify_policy_scoped, only: :index
  before_action :skip_authorization, only: [:dashboard]

  def index
    users = policy_scope([:assessors, User]).
            where(user_assessments: { campaign_id: params[:campaign_id] }).
            ransack(params[:filters]).result
    serialized_users = ActiveModelSerializers::SerializableResource.new(
      users.page(params[:page]), each_serializer: Administration::Assessors::UserSerializer
    )

    render json: {
      list: serialized_users,
      total: users.count
    }
  end

  def dashboard
    raise NotAuthorizedError unless current_user.is?(:assessor)
  end
end
