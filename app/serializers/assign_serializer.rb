# == Schema Information
#
# Table name: assigns
#
#  id            :integer          not null, primary key
#  assessment_id :integer
#  results       :jsonb
#  scoring       :jsonb
#  embedded_data :jsonb
#  status        :integer          default("not_started")
#  role          :integer          default("member")
#  completed_at  :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  step          :integer
#  membership_id :integer
#  norm_data     :jsonb
#  agile_scoring :jsonb
#  started_at    :datetime
#

class AssignSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :results, :embedded_data, :scoring, :user_id,
             :hris, :hash_id, :norm_data, :assessment_id, :external_scoring, :data_sheet, :relationship


  has_one :user, serializer: UserSerializer

  def hris
    object.membership.hris
  end

  def user_id
    object.membership.user_id
  end

  def relationship
    return nil unless @instance_options[:participants_map]

    participant = @instance_options[:participants_map][object.evaluator_id]
    return nil unless participant

    participant.relationship.name
  end

  def hash_id
    object.encode_id
  end

    # TODO (atanych): refactor within https://gitlab.com/tte-lighthouse/psychometrics/issues/59
  def external_scoring
    return {} if object.assessment.psychometric?
    return object.external_results if object.assessment.mindmill?
    if object.assessment.hogan?
      assign_report = object.original_assign.assigns_reports.find { |r| r.hogan_score.present? }
      score = assign_report&.hogan_score&.dig('participant', 'assessment', 'score') || {}
      if score.present?
        return score.each_with_object({}) do |v, res|
          res[normalize_hogan_type(v["type"])] = v["scales"]["scale"].each_with_object({}) do |factor, inner_res|
            inner_res[factor["id"]] = factor["__content__"].to_f
          end
        end
      end
    end
    {}
  end

  def data_sheet
    # TODO (atanych): this serialization can not be used for multi assigns (e.g. for 360)
    row = DatasheetRow.joins(:datasheet).find_by(datasheets: {project_id: object.membership.client_id}, email: object.membership.user.email)
    row&.data || {}
  end

  def normalize_hogan_type(type)
    return 'Raw' if type == 'RAW'
    return 'Percentile' if type == 'percentile'
    raise "Not supported hogan type #{type}"
  end
end
