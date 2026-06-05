# frozen_string_literal: true

module Api
  class V2::Administration::ExternalAssessmentsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    append_before_action :pundit_authorize, except: [:index]
    append_after_action :verify_authorized, except: :index

    def index # rubocop:disable Metrics/CyclomaticComplexity
      search = params[:filter][:filterable_fields]
      case params[:filter][:type_eq]
        when 'hogan'
          render_json_api_response(hogan_assessments(search))
        when 'pearson'
          render_json_api_response(pearson_assessments(search))
        when 'iiht'
          render_json_api_response(iiht_assessments(search))
        when 'saville'
          render_json_api_response(saville_assessments(search))
        when 'mettl'
          render_json_api_response(mettl_assessments(search))
        when 'simulation'
          render_json_api_response(simulation_assessments(search))
        when 'skillvue'
          render_json_api_response(skillvue_assessments(search))
        when 'yoodli'
          render_json_api_response(yoodli_assessments(search))
        when 'mhs'
          render_json_api_response(mhs_assessments(search))
        when 'microsite'
          render_json_api_response(microsite_assessments(search))
      end
    end

    private

    def render_json_api_response(data)
      response = {
        data: data.map do |attrs|
          {
            type: 'external_assessments',
            id: attrs[:id],
            attributes: attrs.except(:id)
          }
        end
      }
      render json: response
    end

    def hogan_assessments(_search)
      Settings.providers.hogan.assessments.map do |a|
        { id: a.id, name: a.name }
      end
    end

    def simulation_assessments(_search)
      Settings.providers.simulation.assessments.map do |a|
        { id: a.id, name: a.name }
      end
    end

    def pearson_assessments(search)
      PearsonAssessment.filterable_fields(search).order(:title).map { |a| { id: a.product_id, name: a.title } }
    end

    def iiht_assessments(search)
      Iiht::GetAssessments.call!(Client.find(params[:filter][:project_id_eq])).
        filter { |a| a['assessmentIdNumber'].include?(search) || a['name'].include?(search) }.
        map do |a|
        { id: a['assessmentIdNumber'], name: a['name'] }
      end
    end

    def saville_assessments(_search)
      Settings.providers.saville.assessments.sort_by { |a| a[:name] }.map do |a|
        { id: a[:id].downcase, name: a[:name] }
      end
    end

    def mettl_assessments(search)
      MettlAssessment.filterable_fields(search).
        where(project_id: params[:filter][:project_id_eq]).
        map { |a| { id: a.product_id, name: a.name } }
    end

    def skillvue_assessments(search)
      SkillvueAssessment.filterable_fields(search).
        where(project_id: params[:filter][:project_id_eq]).
        map { |a| { id: a.product_id, name: a.name } }
    end

    def mhs_assessments(_search)
      Settings.providers.mhs.assessments.sort_by { |a| a[:name] }.map do |a|
        { id: a[:id].downcase, name: a[:name] }
      end
    end

    def microsite_assessments(search)
      MicrositeAssessment.filterable_fields(search).
        where(project_id: params[:filter][:project_id_eq]).
        map { |a| { id: a.product_id, name: a.name } }
    end
  end
end
