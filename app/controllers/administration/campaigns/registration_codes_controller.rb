# frozen_string_literal: true

module Administration
  module Campaigns
    class RegistrationCodesController < Administration::Projects::BaseController
      skip_after_action :verify_policy_scoped, only: %i[index show]
      append_before_action :pundit_authorize
      before_action :set_resource, only: %i[update destroy]

      def index
        @_filter_form = campaign.registration_codes.ransack(params[:filters])
        @_resources = filter_form.result.page(params[:page])

        render json: {
          list: @_resources.map { |r| RegistrationCodeSerializer.new(r) },
          total: @_resources.count
        }
      end

      def create
        form = ::Campaigns::RegistrationCodes::SaveForm.
               from_params(params[:resource], campaign_id: campaign.id)
        if form.valid?
          code = ::Campaigns::RegistrationCodes::Create.call!(form, campaign)
          render json: code, serializer: RegistrationCodeSerializer
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
          render json: code, serializer: RegistrationCodeSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def destroy
        resource.destroy!
        render json: resource.id
      end

      def download_qrcode
        encoded_url = resource.decorate.url
        type = params[:type].downcase
        file = QrCode::Create.call!(encoded_url, type)
        respond_to do |format|
          format.svg { send_data file.read, filename: format(resource.campaign.name, type) }
          format.png { send_data file.read, filename: format(resource.campaign.name, type) }
        end
      end

      private

      def resource_class
        RegistrationCode
      end

      def format(name, type)
        file_name = name.downcase.split(/\s|-|_/).reject(&:blank?).join('_')
        "qr_code_#{file_name}.#{type}"
      end
    end
  end
end
