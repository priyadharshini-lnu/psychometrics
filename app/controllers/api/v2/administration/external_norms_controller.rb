# frozen_string_literal: true

module Api
  class V2::Administration::ExternalNormsController < Api::V2::Administration::BaseController
    append_before_action :pundit_authorize, except: [:index]
    append_after_action :verify_authorized, except: :index
    def index
      case params[:filter][:type_eq]
        when 'pearson'
          data = Assessments::PearsonSettings.norms(params[:filter][:assessment_id_eq])
          render_json_api_response(data)
        else
          render json: { data: [] }
      end
    end

    def render_json_api_response(data)
      response = {
        data: data.map do |attrs|
          {
            type: 'ExternalNorm',
            id: attrs[:id],
            attributes: attrs.except(:id)
          }
        end
      }
      render json: response
    end
  end
end
