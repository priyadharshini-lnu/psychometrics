module Administration
  module Clients
    module Users
      class AssignsController < Administration::BaseController
        prepend_before_action :set_resource_class
        before_action :set_membership
        before_action :set_resource, only: [:destroy, :destroy_report]
        append_before_action :pundit_authorize, :init_breadcrumbs

        def index
          @filter_form = policy_scope(::Assign).where(id: membership.assign_ids).includes(:assessment).search(params[:q])
          @resources = @filter_form.result.page(params[:page])
          @reports = policy_scope(Report).
              ransack(clients_reports_client_id_eq: client.id).result.
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
          client.assign_clients.find_or_create_by(assessment: @assessment)

          assigns_scope = membership.assigns
          @resource = assigns_scope.where(assessment_id: @assessment.id).take || assigns_scope.build(resource_params)
          if resource.new_record?
            resource.save
          else
            resource.report_ids = resource_params[:report_ids]
          end
        rescue ActiveRecord::RecordInvalid
          resource.errors.add(:base, :has_no_enough_licenses) if resource.errors[:base].empty?
        ensure
          respond_to do |format|
            format.js { render :new if resource.errors.any? }
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

        def reports
          form = client.reports.search(params[:q])
          @resources = form.result

          respond_to do |format|
            format.json
          end
        end

        private

        def set_resource_class
          @resource_class ||= Assign
        end

        def init_breadcrumbs
          add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
          add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
          add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
          add_breadcrumb client.project.decorate.display_name, administration_client_project_campaigns_path(client.client, client.project) unless client.project_level?
          add_breadcrumb client.decorate.display_name, administration_client_users_path(client)
          add_breadcrumb I18n.t('administration.clients.users.assigns.index.title', name: membership.decorate.display_name), { action: :index }
        end

        def set_membership
          @_membership = policy_scope(::Membership).join_user.includes(:client, :assigns).find(params[:user_id])
          @_client = membership.client
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
