# frozen_string_literal: true

module Api
  class V2::Administration::ExternalReportsController < Api::V2::Administration::BaseController
    append_before_action :pundit_authorize, except: [:index]
    append_after_action :verify_authorized, except: :index

    def index
      assessment_ids_in = params[:filter][:assessment_ids_in]
      return render_json_api_response([]) unless assessment_ids_in

      assessment_ids = assessment_ids_in.split(',')
      type = params[:filter][:type_eq]
      case type
        when 'hogan'
          render_json_api_response(hogan_assessments(assessment_ids))
        when 'saville'
          render_json_api_response(saville_assessments(assessment_ids))
        else
          render_json_api_response([])
      end
    end

    private

    def render_json_api_response(data)
      response = {
        data: data.map do |attrs|
          {
            type: 'external_reports',
            id: attrs[:id],
            attributes: attrs.except(:id)
          }
        end
      }
      render json: response
    end

    def hogan_assessments(assessment_ids)
      hogan_assessment_ids = Assessment.where(id: assessment_ids, type: Assessment::TYPES[:hogan]).map do |assessment|
        assessment.external_settings['assessment_id']
      end.uniq

      return [] unless hogan_assessment_ids.count.positive? && hogan_assessment_ids.count == assessment_ids.count

      Settings.providers.hogan.reports.select do |report|
        report[:assessment_ids].to_set == hogan_assessment_ids.to_set
      end.map { |r| { id: r[:id], name: r[:name] } }
    end

    def saville_assessments(assessment_ids)
      return [] unless assessment_ids.count == 1

      saville_assessment_ids = Assessment.where(id: assessment_ids, type: Assessment::TYPES[:saville]).map do |a|
        a.external_settings['assessment_id']
      end.uniq

      assessment = Settings.providers.saville.assessments.find { |a| saville_assessment_ids.include?(a[:id].downcase) }

      return [] unless assessment

      Settings.providers.saville.reports.select { |r| assessment[:report_ids].include?(r[:id]) }.map do |report|
        { id: report.id.downcase, name: report.name }
      end
    end
  end
end
