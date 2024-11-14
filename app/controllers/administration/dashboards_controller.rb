# frozen_string_literal: true

class Administration::DashboardsController < Administration::BaseController
  include AsyncRequestHandler

  before_action :skip_policy_scope

  async_request :get_embed_token_async, handler: OracleAnalytics::GetEmbedToken,
    permit_params: ->(params) { params.require(:dashboard).permit(:id) }

  def index
    authorize Dashboard, :index?, policy_class: Api::Administration::DashboardPolicy

    redirect_to admin_path unless helpers.show_dashboard?
  end

  def oracle_analytics_embed
    authorize Dashboard, :index?, policy_class: Api::Administration::DashboardPolicy

    @dashboard ||= Api::Administration::DashboardPolicy::Scope.new(
      current_user, Dashboard
    ).resolve.find(params[:id])

    @embed_token = params[:embed_token]

    render 'oracle_analytics_embed', layout: nil
  end

  def get_embed_token
    authorize Dashboard, :index?, policy_class: Api::Administration::DashboardPolicy

    get_embed_token_async
  end
end
