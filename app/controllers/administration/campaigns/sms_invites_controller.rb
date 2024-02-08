# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsInvitesController < Administration::Campaigns::BaseController
      before_action :set_resource, only: %i[update destroy]

      def index
        sms_invites = campaign.
                      sms_invites.
                      includes(:creator, :registered_user).
                      ransack(params[:filters]).result

        # rubocop:disable Metrics/BlockLength
        respond_to do |format|
          format.csv do
            headers['Content-Disposition'] = 'attachment; filename="users.csv"'
            headers['Content-Type'] ||= 'text/csv'
            render :index, locals: {
              sms_invites: sms_invites,
              campaign: campaign,
              resource_class: resource_class,
              headers: SmsInvites::ImportForm::VALID_HEADERS
            }
          end
          format.json do
            serialized_sms_invites = Panko::ArraySerializer.new(
              sms_invites.page(params[:page]),
              each_serializer: Administration::Campaigns::SmsInvitesSerializer,
              context: {
                current_user: current_user,
                campaign_id: campaign.id,
                project_id: campaign.project_id
              }
            ).to_a

            render json: {
              list: serialized_sms_invites,
              invite_url_length: Utility::Url.get_short_url(unique_key: '*' * Shortener.unique_key_length).length,
              total: sms_invites.count,
              permissions: permissions
            }
          end
        end
        # rubocop:enable Metrics/BlockLength
      end

      def create
        form = ::SmsInvites::Form.from_params(resource_params).
               with_context(campaign: campaign)
        if form.valid?
          sms_invite = campaign.sms_invites.create!(
            form.attributes.merge(creator: current_user)
          )
          render json: Administration::Campaigns::SmsInvitesSerializer.new.serialize(sms_invite)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def update
        form = ::SmsInvites::Form.from_params(resource_params).
               with_context(campaign: campaign, sms_invite: resource)
        if form.valid?
          resource.update!(form.attributes)
          render json: Administration::Campaigns::SmsInvitesSerializer.new.serialize(resource)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def destroy
        resource.destroy!

        render json: resource.id
      end

      def import
        import_data = CSV.parse(File.read(params[:file].path), headers: :first_row).map(&:to_h)
        return head :ok if import_data.blank?

        form = ::SmsInvites::ImportForm.new(import_data: import_data).with_context(campaign: campaign)
        if form.valid?
          AdminJob.call(:import_sms_invites, {
            campaign_id: params[:new_campaign_id]
          }, current_user, params[:file])
          head :ok
        else
          render json: { errors: form.errors.messages.map { |_k, v| v }.flatten }, status: 422
        end
      end

      def search
        sms_invites = campaign.sms_invites.ransack(params).result.limit(10)

        render json: Panko::ArraySerializer.new(
          sms_invites,
          each_serializer: Administration::Campaigns::SmsInvitesSearchSerializer
        ).to_a
      end

      def download_example_import_file
        send_file(
          Rails.public_path.join('example_csv/sms_invite_import.csv'),
          type: 'text/csv'
        )
      end

      private

      def resource_class
        @resource_class ||= SmsInvite
      end

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= campaign.sms_invites.find(params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: project.id,
          campaign_id: campaign.id,
          policy_class: Administration::Campaigns::SmsInvitePolicy
        )
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::Campaigns::SmsInvitePolicy,
          current_user,
          nil,
          %w[import export send_sms create update destroy],
          {
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        )
      end
    end
  end
end
