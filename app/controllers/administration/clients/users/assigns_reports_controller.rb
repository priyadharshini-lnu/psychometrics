# frozen_string_literal: true

module Administration
  module Clients
    module Users
      class AssignsReportsController < Administration::BaseController
        include Administration::Clients
        prepend_before_action :set_resource_class
        before_action :set_membership
        before_action :set_resource, only: %i[toggle_user_access edit update destroy regenerate]
        append_before_action :pundit_authorize

        def new
          @report_families = client.root.
                             report_families.
                             includes(:reports, :reportfamilies_reports).
                             where(reports: { disabled: false }).
                             references(:reports).
                             distinct
          @_resource = ::Clients::Reports::AssignReportForm.new
        end

        def create
          @report_families = client.root.
                             report_families.
                             includes(:reports, :reportfamilies_reports).
                             where(reports: { disabled: false }).
                             references(:reports).
                             distinct
          @_resource = ::Clients::Reports::AssignReportForm.
                       from_params(params[:resource]).
                       with_context(client: client, client_tenancy: client.root)
          resource.is_applying_to_existing_users = false

          respond_to do |format|
            format.js do
              ::Clients::Reports::AssignReportToMembership.call(resource, client, membership) do
                on(:invalid) { render :new }
              end
            end
          end
        end

        def toggle_user_access
          resource.toggle!(:user_access)
        rescue ActiveRecord::RecordInvalid => e
          respond_to do |format|
            format.js { render(:error, locals: { message: e.message }) }
          end
        end

        def destroy
          resource.destroy!
        rescue ActiveRecord::RecordInvalid => e
          respond_to do |format|
            format.js { render(:error, locals: { message: e.message }) }
          end
        end

        def i18n
          'clients.users.assigns_reports'
        end

        # Regenerates PDF file
        #
        def regenerate
          status = AssignsReports::GenerateReport.call!(resource, current_user)
          @report_generatable = status == AssignsReports::GenerateReport::ALL_SUCCESSFULL
          unless @report_generatable
            assessment_ids = Reports::IncompleteAssignsQuery.new(resource.report, resource.assign).query.
                             pluck(:assessment_id)
            @incomplete_assessment_names = Assessment.where(id: assessment_ids).pluck(:name).join(', ')
          end

          render :regenerate, format: [:js]
        end

        private

        def set_resource_class
          @_resource_class = AssignsReport
        end

        def set_membership
          @_membership = policy_scope(::Membership).join_user.includes(:client).find(params[:user_id])
          @_client = membership.client
        end

        def resource_params
          params.require(:resource).permit(:user_access)
        end

        def pundit_authorize
          raise Pundit::NotAuthorizedError, 'Wrong Membership' unless policy(membership).overview_assigns?

          super
        end
      end
    end
  end
end
