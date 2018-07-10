module Administration
  module Clients
    module Users
      class AssignsController < Administration::BaseController
        include Administration::Clients
        prepend_before_action :set_resource_class
        before_action :set_membership
        before_action :set_resource, only: [:destroy, :destroy_report]
        append_before_action :pundit_authorize, :init_breadcrumbs

        def index
          @_filter_form = policy_scope(::Assign).where(id: membership.assign_ids).includes(:assessment).search(params[:q])
          @_resources = filter_form.result.page(params[:page])
          @reports = policy_scope(Report).
              ransack(clients_reports_client_id_eq: client.id).result.
              group_by(&:assessment_id)
          respond_to do |format|
            format.html
            format.js { render :index, formats: [:js] }
          end
        end

        def new
          @_resource = resource_class.new
        end

        def create
          # TODO: extract to ActiveModel Form Objects
          return unless resource_params[:assessment_id]
          @assessment = client.assessments.find(resource_params[:assessment_id])
          assigns_scope = membership.assigns
          @_resource = assigns_scope.where(assessment_id: @assessment.id).take || assigns_scope.build(resource_params)
          resource.user_access = resource_params[:user_access]

          begin
            if @assessment.hogan?
              assessment_params = {
                group: client.project.hogan_group_name,
                membership: membership.membership_with_result,
                assessment: @assessment,
                reports: resource.reports
              }
              result = Services::Hogan::AssignAssessmentAndReports.call!(assessment_params: assessment_params)
            end

            if resource.new_record?
              resource.save
            else
              resource.reports << Report.where(id: resource_params[:report_ids])
            end
          rescue Errors::LicenseError => e
            resource.errors.add(:base, e.message) if resource.errors[:base].empty?
          rescue Interactor::Failure => e
            Rails.logger.error(e.context)
            resource.errors.add(:base, e.context.error) if e.context.error
          end
          render :new if resource.errors.any?
        end

        def destroy
          resource.destroy
          respond_to do |format|
            format.html { redirect_back(fallback_location: root_path, success: t('.successfully')) }
            format.js
          end
        end

        def destroy_report
          @report = Report.find(params[:report_id])
          resource.reports.delete(@report)
          respond_to do |format|
            format.html { redirect_back(fallback_location: root_path, success: t('.successfully')) }
            format.js
          end
        end

        def reports
          @_resources = client.reports.joins(:assessments_reports).
            where(assessments_reports: { assessment_id:  params[:assessment_id] }).distinct
          @selected_reports = client.assign_by_membership_and_assessment(params[:user_id], params[:assessment_id])&.reports
          respond_to do |format|
            format.json
          end
        end

        private

        def set_resource_class
          @_resource_class = Assign
        end

        def init_breadcrumbs
          client_root_breadcrumb
          add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
          add_breadcrumb client.project.decorate.display_name, administration_client_project_campaigns_path(client.client, client.project) if client.subtenancy?
          add_breadcrumb client.parent.decorate.display_name, administration_client_project_campaign_sub_campaigns_path(client.client, client.project, client.parent) if client.sub_campaign?
          add_breadcrumb client.decorate.display_name, administration_client_users_path(client)
          add_breadcrumb I18n.t('administration.clients.users.assigns.index.title', name: membership.decorate.display_name), { action: :index }
        end

        def set_membership
          @_membership = policy_scope(::Membership).join_user.includes(:client, :assigns).find(params[:user_id])
          @_client = membership.client
        end

        def resource_params
          params.require(:resource).permit(:assessment_id, :user_access, report_ids: [])
        end

        def pundit_authorize
          raise Pundit::NotAuthorizedError, 'Wrong Membership' unless policy(membership).overview_assigns?
          super
        end
      end
    end
  end
end
