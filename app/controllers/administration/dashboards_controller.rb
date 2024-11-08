# frozen_string_literal: true

class Administration::DashboardsController < Administration::BaseController
  before_action :skip_policy_scope

  def index
    authorize Dashboard, :index?, policy_class: Api::Administration::DashboardPolicy

    redirect_to admin_path unless helpers.show_dashboard?
  end

  def oracle_analytics_embed
    authorize Dashboard, :index?, policy_class: Api::Administration::DashboardPolicy

    @dashboard ||= Api::Administration::DashboardPolicy::Scope.new(
      current_user, Dashboard
    ).resolve.find(params[:id])
    @embed_token = OracleAnalytics::GetEmbedToken.call!(current_user)

    render 'oracle_analytics_embed', layout: nil
  end
end
