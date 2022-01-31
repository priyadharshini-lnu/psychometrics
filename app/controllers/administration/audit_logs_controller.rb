# frozen_string_literal: true

module Administration
  class AuditLogsController < Administration::BaseController
    before_action :authenticate_user!
    before_action :set_log, only: %i[show destroy]

    def index
      @q = policy_scope(::AuditLog).ransack(params[:filters])
      @logs = @q.result.order('id desc').includes(:user).page(params[:page]).per(15)
      respond_to do |format|
        format.html
        format.json do
          render json: {
            list: @logs.map { |l| AuditLogSerializer.new(l) },
            total: @logs.count,
            types: policy_scope(::AuditLog).pluck(:record_type).uniq
          }
        end
      end
    end

    def show
      authorize @log
      respond_to do |format|
        format.html
        format.json { render json: @log, serializer: AuditLogSerializer }
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
