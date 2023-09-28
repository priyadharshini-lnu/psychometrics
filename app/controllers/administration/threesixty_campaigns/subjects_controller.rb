# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class SubjectsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit update destroy spoof preview_report]
      append_before_action :pundit_authorize

      def index
        query = policy_scope(::Threesixty::Subject).
                includes(:user).
                where(campaign_id: threesixty_campaign.campaign_id).
                where(
                  'users.first_name ILIKE ? OR users.last_name ILIKE ? OR users.email ILIKE ?',
                  "%#{params[:q]}%", "%#{params[:q]}%", "%#{params[:q]}%"
                ).
                references(:user).
                order(id: :desc)
        subjects = ::Threesixty::Subjects::Serialize.call!(
          query.page(params[:page]), threesixty_campaign, current_user
        )
        total = query.count
        render json: { subjects: subjects, total: total, permissions: permissions }
      end

      def search
        users = ::Threesixty::Subjects::UsersQuery.new(threesixty_campaign.campaign, params[:q]).query.map do |user|
          ::Projects::SearchUserSerializer.new(user).to_h
        end
        render json: users
      end

      def update
        resource.update!(resource_params)
        if resource_params[:report_release_status] == 'released' ||
           resource_params[:report_approval_status] == 'approved'
          ::Threesixty::Emails::Send.call!(
            ::Threesixty::Emails::Name::SUBJECT_REPORT_READY,
            threesixty_campaign: threesixty_campaign,
            subject: resource
          )
        end
        render json: ::Threesixty::Subjects::Serialize.call!([resource], threesixty_campaign, current_user).first
      end

      def destroy
        remove_license_usage = current_user.is?(:superadmin) ? params['remove_licence_usage'] : nil
        ::Threesixty::Subjects::Remove.call!(
          threesixty_campaign: threesixty_campaign,
          updater_id: current_user.id,
          subject: resource,
          remove_license_usage: remove_license_usage
        )
        render json: :ok
      end

      def create_all
        form = ::Threesixty::Subjects::CreateAllForm.from_params(params).
               with_context(campaign: threesixty_campaign.campaign)
        if form.valid?
          ::Threesixty::Subjects::CreateAll.call!(form.subjects, threesixty_campaign, current_user)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      def preview_report
        user_report = UserReport.find_by!(
          campaign_id: threesixty_campaign.campaign_id, user_id: resource.user_id
        )

        @data = ::Reports::PrepareDataForReport.call!(
          campaign_user_report: user_report,
          locale: user_report.report.default_language,
          current_user: current_user
        )
      end

      def download_example_import_file
        send_file(
          Rails.public_path.join('example_csv/subject_import.csv'),
          type: 'text/csv'
        )
      end

      def import
        form = ::Threesixty::Subjects::ImportFileForm.from_params(params).
               with_context(campaign: threesixty_campaign.campaign)
        if form.valid?
          validate_and_add_subjects_from_csv(form.file.path)
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      private

      def permissions
        subject_permissions.merge(campaign_permissions)
      end

      def subject_permissions
        GetPermissionsHash.call!(
          Administration::Threesixty::SubjectPolicy,
          current_user,
          nil,
          [
            %w[add_subject create_all],
            'manage_datasheets',
            'export_results',
            'export_completion_status',
            'reset_all_participants',
            'reset_all_nominations',
            'edit_user',
            'allow_results_delete'
          ],
          {
            project_id: threesixty_campaign.campaign.project_id,
            campaign_id: threesixty_campaign.campaign_id
          }
        )
      end

      def campaign_permissions
        GetPermissionsHash.call!(
          Administration::Threesixty::CampaignPolicy,
          current_user,
          nil,
          %w[
            rescore_assessment
            bulk_regenerate_reports
          ],
          {
            project_id: threesixty_campaign.campaign.project_id
          }
        )
      end

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Subject # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def resource_params
        params.require(:subject).permit(:report_release_status, :report_approval_status, :evaluation_status)
      end

      def validate_and_add_subjects_from_csv(file_path)
        form = ::Threesixty::Subjects::CreateAllForm.new(subjects: subjects_from_csv(file_path)).
               with_context(
                 campaign: threesixty_campaign.campaign,
                 single_subject_form: ::Threesixty::Subjects::ImportOneForm
               )

        if form.valid?
          result = ::Threesixty::Subjects::CreateAll.call!(form.subjects, threesixty_campaign)
          render json: result.slice(:existing_subjects_whose_password_not_changed)
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      def subjects_from_csv(file_path)
        csv = CSV.read(file_path, encoding: 'bom|utf-8', headers: true)
        csv.map { |row| row.to_h.symbolize_keys }
      end
    end
  end
end
