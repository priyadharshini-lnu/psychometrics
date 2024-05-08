# frozen_string_literal: true

module Administration
  module Campaigns
    class RegistrationCodesController < Administration::Campaigns::BaseController
      skip_after_action :verify_policy_scoped, only: %i[index show]
      append_before_action :pundit_authorize
      before_action :set_resource, only: %i[update destroy download_qrcode]

      def index
        @_filter_form = campaign.registration_codes.ransack(params[:filters])
        @_resources = filter_form.result.page(params[:page])
        render json: {
          list: Panko::ArraySerializer.new(
            resources,
            each_serializer: RegistrationCodeSerializer,
            context: {
              current_user: current_user, project_id: campaign.project_id, campaign_id: campaign.id
            }
          ).to_a,
          total: @_resources.count,
          permissions: permissions
        }
      end

      def create
        form = ::Campaigns::RegistrationCodes::SaveForm.
               from_params(params[:resource], campaign_id: campaign.id)
        if form.valid?
          code = ::Campaigns::RegistrationCodes::Create.call!(form, campaign)
          audit! :create, code, payload: params, campaign: campaign
          render json: RegistrationCodeSerializer.new(
            context: {
              project_id: campaign.project_id, campaign_id: campaign.id, current_user: current_user
            }
          ).serialize(code)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def update
        form = ::Campaigns::RegistrationCodes::SaveForm.
               from_params(params[:resource].merge(
                             project_id: resource.project_id,
                             campaign_id: resource.campaign_id
                           )).
               with_context(registration_code: resource)
        if form.valid?
          code = ::Campaigns::RegistrationCodes::Update.call!(form, resource)
          audit! :update, code, payload: params, campaign: campaign
          render json: RegistrationCodeSerializer.new(
            context: {
              project_id: campaign.project_id, campaign_id: campaign.id, current_user: current_user
            }
          ).serialize(code)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def destroy
        resource.destroy!
        audit! :delete, resource, payload: resource.log_attribute_for_delete, campaign: campaign
        render json: resource.id
      end

      def download_qrcode
        encoded_url = resource.decorate.url
        respond_to do |format|
          format.any(:svg, :png) do
            type = request.format.to_sym.to_s
            file = QrCode::Create.call!(encoded_url, type)
            send_data file.read, filename: "qr_code_#{resource.campaign.name.parameterize.underscore}.#{type}"
          end
        end
      end

      private

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: campaign.project_id,
          campaign_id: campaign.id
        )
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::RegistrationCodePolicy,
          current_user,
          nil,
          [
            'create'
          ],
          {
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        )
      end

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= campaign.registration_codes.find(params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName

      def resource_class
        RegistrationCode
      end
    end
  end
end
