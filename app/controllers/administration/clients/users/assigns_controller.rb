module Administration
  module Clients
    module Users
      class AssignsController < Administration::BaseController
        prepend_before_action :set_resource_class
        before_action :set_membership
        before_action :set_resource, only: [:destroy, :destroy_report]
        before_action :init_breadcrumbs
        append_before_action :pundit_authorize

        def index
          @filter_form = policy_scope(::Assign).where(id: @membership.assign_ids).includes(:assessment).search(params[:q])
          @resources = @filter_form.result.page(params[:page])
          @reports = policy_scope(Report).
              ransack(client_reports_client_id_eq: @client.id).result.
              group_by(&:assessment_id)
          respond_to do |format|
            format.html
            format.js { render :index, formats: [:js] }
          end
        end

        def new
          @resource = Assign.new
        end

        def create
          @assessment = policy_scope(Assessment).find(resource_params[:assessment_id])
          # Ensure that client tenancy has assigned assessment
          #   Or create assign
          @client.assign_clients.find_or_create_by(assessment: @assessment)
          if @membership.assessments.include? @assessment
            @resource = @assessment.assigns.where(membership_id: @membership.id).first
            @resource.report_ids += resource_params[:report_ids]
          else
            @resource = @membership.assigns.build(resource_params)
            @resource.save
          end
          respond_to do |format|
            format.js { render :new if @resource.errors.any? }
          end
        end

        def destroy
          @resource.destroy
          respond_to do |format|
            format.html { redirect_to(:back, success: t('.successfully')) }
            format.js
          end
        end

        def destroy_report
          @report = Report.find(params[:report_id])
          @resource.reports.delete(@report)
          respond_to do |format|
            format.html { redirect_to(:back, success: t('.successfully')) }
            format.js
          end
        end

        private

        def set_resource_class
          @resource_class ||= Assign
        end

        def init_breadcrumbs
          add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
          add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, @client, :users]
          add_breadcrumb @membership.client.decorate.display_name, [:administration, @client, :users]
          add_breadcrumb @membership.user.decorate.display_name, '#'
          add_breadcrumb I18n.t('administration.breadcrumbs.reports'), { action: :index }
        end

        def set_membership
          @membership = policy_scope(::Membership).join_user.includes(:client, :assigns).find(params[:user_id])
          @client = @membership.client
        end

        def set_resource
          @resource = @resource_class.find(params[:id])
        end

        def resource_params
          params.require(:resource).permit(:assessment_id, report_ids: [])
        end

        # Authorisation user
        def pundit_authorize
          authorize @resource || @resource_class
        end
      end
    end
  end
end
