module Administration
  module Clients
    class StatisticsController < Administration::BaseController
      before_action :set_client, :set_resource_class
      append_before_action :pundit_authorize
      after_action :init_breadcrumbs

      # GET /administration/resources
      def index
        @filter_form = policy_scope(@resource_class).search(params[:q])
        @resources = @filter_form.
                     result.
                     joining { |a| a.membership.on(a.membership.id.eq(a.membership_id) & (a.membership.client_id == client.id)) }.
                     joining { assessment }.
                     selecting { ['COUNT(CASE WHEN assigns.status = 0 THEN 1 ELSE null END) AS new_count',
                                  'COUNT(CASE WHEN assigns.status = 1 THEN 1 ELSE null END) AS in_progress_count',
                                  'COUNT(CASE WHEN assigns.status = 2 THEN 1 ELSE null END) AS completed_count',
                                  assessment.name,
                                  assessment_id.as('id')] }.
                     grouping { [assessment_id, assessment.name] }
        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        add_breadcrumb client.decorate.display_name, '#'
        add_breadcrumb I18n.t('administration.breadcrumbs.reports'), { action: :index }
      end

      # Set model
      def set_resource_class
        @resource_class ||= Assign
      end

      # Authorisation user
      def pundit_authorize
        authorize @resource_class
      end
    end
  end
end
