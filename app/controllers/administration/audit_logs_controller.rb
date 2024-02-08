# frozen_string_literal: true

module Administration
  class AuditLogsController < Administration::BaseController
    before_action :authenticate_user!
    before_action :set_log, only: %i[show destroy]

    render_entrypoint %i[index show], element: 'audit-logs', entry: 'admin/audit_logs'

    def index
      @q = policy_scope(::AuditLog).eager_load(:user).ransack(params[:filters])
      @logs = @q.result.order('audit_logs.id desc')
      respond_to do |format|
        format.json do
          serialized_logs = Panko::ArraySerializer.new(
            @logs.page(params[:page]).includes(:client, :project, :campaign).
            per(params[:size] || 25),
            each_serializer: AuditLogSerializer
          ).to_a
          render json: {
            list: serialized_logs,
            total: @logs.count,
            types: policy_scope(::AuditLog).distinct(:record_type).pluck(:record_type).compact.sort,
            actions: policy_scope(::AuditLog).distinct(:action).pluck(:action).compact.sort
          }
        end
      end
    end

    def show
      authorize @log
      respond_to do |format|
        format.json { render json: AuditLogSerializer.new.serialize(@log) }
      end
    end

    def actions
      authorize(::AuditLog)
      types = policy_scope(::AuditLog).where(record_type: params[:type]).pluck(:action).uniq
      render json: types
    end

    private

    def set_log
      @log = policy_scope(::AuditLog).find(params[:id])
    end
  end
end
