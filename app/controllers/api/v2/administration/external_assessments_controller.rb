# frozen_string_literal: true

module Api
  class V2::Administration::ExternalAssessmentsController < Api::V2::Administration::BaseController
    append_before_action :pundit_authorize, except: [:index]
    append_after_action :verify_authorized, except: :index

    def index
      search = params[:filter][:filterable_fields]
      case params[:filter][:type_eq]
        when 'hogan'
          render json: { data: hogan_response(search) }
        when 'pearson'
          render json: { data: pearson_response(search) }
        when 'iiht'
          render json: { data: iiht_response(search) }
        when 'saville'
          render json: { data: saville_response(search) }
      end
    end

    private

    def hogan_response(_search)
      Settings.providers.hogan.assessments.map do |a|
        { id: a.id, type: 'external_assessments', attributes: { name: a.name } }
      end
    end

    def pearson_response(search)
      PearsonAssessment.filterable_fields(search).order(:title).map { |a| { id: a.product_id, name: a.title } }
    end

    def iiht_response(search)
      Iiht::GetAssessments.call!(Client.find(params[:filter][:project_id_eq])).
        filter { |a| a['assessmentIdNumber'].include?(search) || a['name'].include?(search) }.
        map do |a|
        { id: a['assessmentIdNumber'], name: a['name'] }
      end
    end

    def saville_response(_search)
      Settings.providers.saville.assessments.sort_by { |a| a[:name] }.map do |a|
        { id: a[:id].downcase, type: 'external_assessments', attributes: { name: a[:name] } }
      end
    end
  end
end
