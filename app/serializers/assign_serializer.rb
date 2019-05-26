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
  attributes :id, :status, :step, :results, :embedded_data, :scoring, :user_id, :relationship,
             :hris, :hash_id, :norm_data, :assessment_id, :external_scoring, :data_sheet, :selected_locale

  attribute :agile_scoring, if: -> { object.membership_id == @instance_options[:membership].try(:id) }

  has_one :user, serializer: UserSerializer

  def relationship
    object.membership.decorate(context: { current_membership: @instance_options[:membership] }).relationship if @instance_options[:membership]
  end

  def hris
    object.membership.hris
  end

  def user_id
    object.membership.user_id
  end

  def hash_id
    object.encode_id
  end

  def selected_locale
    locale = object.selected_locale || I18n.default_locale 
    {
      code: locale,
      name: I18n.t("languages.#{locale}")
    }
  end

  def norm_data
    object.norm_data[:name] = @instance_options[:norm] if @object.norm_data
    object.norm_data
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
