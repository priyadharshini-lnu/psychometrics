module Administration
  module Assessments
    class AssignsController < Administration::BaseController
      before_action :set_assessment, :set_resource_class
      # Setup search object on Membership
      append_before_action :init_search_users, only: [:not_selected_users, :selected_users]
      append_before_action :init_breadcrumbs
      after_action :pundit_authorize

      def new
        @assign_form = Administration::Assessments::AssignForm.new(assign_params)
      end

      def create
        init_assign_form
        @reports = policy_scope(Report).for_clients(@clients.map(&:id)).where(id: @assign_form.report_ids).distinct

        # Update or Create assigns
        policy_scope(Membership).where(id: @assign_form.membership_ids).find_each do |membership|
          assign = membership.assigns.find_or_initialize_by(assessment_id: @assessment.id)
          assign.role = :member
          assign.role = :manager if @assign_form.manager_ids.include?(membership.id.to_s)
          @reports.each do |report|
            assigns_report = assign.assigns_reports.find_or_initialize_by(report_id: report.id)
            assigns_report.access_reports_at = @assign_form.access_reports_at
          end
          next if assign.save

          assign.errors.details.values.flatten.each do |message|
            @assign_form.errors.add(:base, message[:error])
          end
        end

        if @assign_form.errors.any?
          render :new
        else
          redirect_to(administration_assessments_path, success: t('.successfully', name: @assessment.decorate.display_name))
        end
      end

      def form
        init_assign_form
        respond_to do |format|
          format.js
        end
      end

      def not_selected_users
        @users = @search.result(distinct: true)
        respond_to do |format|
          format.json { render json: ::ActiveModel::Serializer::CollectionSerializer.new(@users, serializer: MembershipSerializer).to_json }
        end
      end

      def selected_users
        # If was not any chosen users
        #   Then not show users
        @search.id_blank = true if @search.id_in.nil?

        @users = @search.result(distinct: true)
        respond_to do |format|
          format.json { render json: ::ActiveModel::Serializer::CollectionSerializer.new(@users, serializer: MembershipSerializer).to_json }
        end
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.assessments'), [:administration, :assessments]
        add_breadcrumb t('.title', name: @assessment.decorate.display_name), request.path
      end

      def assign_params
        params.fetch(:assign, {}).permit(:access_reports, :access_reports_at_date, :access_reports_at_time,
                                         client_ids: [], report_ids: [], manager_ids: [], user_ids: [])
      end

      def init_assign_form
        @assign_form = Administration::Assessments::AssignForm.new(assign_params)
        @clients = policy_scope(::Client).where(id: @assign_form.client_ids)
        @managers = policy_scope(::Membership).
            select('memberships.*', 'clients.name as client_name').
            joins(:client).
            join_user.
            where(client_id: @assign_form.client_ids, role: Membership::MANAGER_ROLE).
            group_by(&:client_name)
        @filter_form = Membership.search(client_id_in: @clients.map(&:id))
        @filter_form.id_not_in = @assign_form.user_ids
        @filter_form.id_in = @assign_form.user_ids
        @users = policy_scope(Membership).search(client_id_in: @clients.map(&:id)).result
      end

      def init_search_users
        @search = policy_scope(::Membership).join_user.includes(:client).search(params[:q])

        # Limit to use only assigned clients
        #   And clients where user has access
        client_ids = policy_scope(Client).where(id: params.require(:client_ids)).pluck(:id)
        @search.client_id_in = @search.client_id_in.blank? ? client_ids : client_ids & @search.client_id_in
      end

      # Set model
      def set_resource_class
        @_resource_class ||= ::Assign
      end

      def set_assessment
        @assessment = policy_scope(::Assessment).includes(:reports).find(params[:assessment_id])
      end

      # Authorisation user
      def pundit_authorize
        authorize [:assessments, :assign]
      end
    end
  end
end
