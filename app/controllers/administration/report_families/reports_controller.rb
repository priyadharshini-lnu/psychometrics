# frozen_string_literal: true

module Administration
  module ReportFamilies
    class ReportsController < Administration::BaseController
      before_action :set_report_family
      append_before_action :pundit_authorize
      append_before_action :init_breadcrumbs

      def index
        @_filter_form = @report_family.reports.distinct.search(params[:q])
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @reports = policy_scope(::Report).enabled.where.has { |scope| scope.id.not_in(@report_family.report_ids) }
        @form = AssignReportForm.new
      end

      def create
        @reports = policy_scope(::Report).enabled.where.has { |scope| scope.id.not_in(@report_family.report_ids) }
        @form = AssignReportForm.
                from_params(params.require(:resource)).
                with_context(report_family: @report_family)


        respond_to do |format|
          AssignReport.call(@form, @report_family) do
            on(:ok)      { format.js }
            on(:invalid) { render :new }
          end
        end
      end

      def destroy
        respond_to do |format|
          RemoveReport.call(params[:id], @report_family) do
            on(:ok)      { format.js }
            on(:invalid) { render :index }
          end
        end
      end

      # Set model
      def resource_class
        @_resource_class ||= Report
      end

      protected

      def set_report_family
        @report_family = policy_scope(::ReportFamily).find(params[:report_family_id])
      end

      # Initialize breadcrumbs
      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
        add_breadcrumb I18n.t('administration.breadcrumbs.report_families'), %i[administration report_families]
        add_breadcrumb @report_family.name, action: :index, report_family_id: @report_family.id
      end

      # Authorisation user
      def pundit_authorize
        authorize %i[report_families report]
      end
    end
  end
end
