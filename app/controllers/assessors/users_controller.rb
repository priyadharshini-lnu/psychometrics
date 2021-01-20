# frozen_string_literal: true

class Assessors::UsersController < Administration::BaseController
  skip_after_action :verify_policy_scoped, only: :index
  before_action :skip_authorization, only: %i[dashboard show]
  before_action :set_resource, only: [:show]

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

  def show
    user_assessments = UserAssessment.where(evaluator: current_user, subject: @user, campaign_id: params[:campaign_id])
    user_reports = UserReport.assessor_report_for_campaign(params[:campaign_id]).where(user_id: @user.id)
    serialized_user_assessments = ActiveModelSerializers::SerializableResource.new(
      user_assessments, each_serializer: Administration::Assessors::UserAssessmentSerializer
    )
    serialized_user_reports = ActiveModelSerializers::SerializableResource.new(
      user_reports, each_serializer: Administration::Assessors::UserReportSerializer
    )
    render json: {
      user: Administration::Assessors::UserSerializer.new(@user).to_h,
      user_assessments: serialized_user_assessments,
      user_reports: serialized_user_reports
    }
  end

  def dashboard
    raise NotAuthorizedError unless current_user.is?(:assessor)
  end

  private

  def set_resource
    @user = policy_scope([:assessors, User]).find(params[:id])
  end
end
