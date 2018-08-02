# == Schema Information
#
# Table name: reports
#
#  id            :integer          not null, primary key
#  assessment_id :integer
#  name          :string
#  disabled      :boolean          default(FALSE)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  type          :integer          default("common")
#

class ReportSerializer < ActiveModel::Serializer
  attributes :id, :name, :disabled, :created_at, :filters, :factors, :assigns, :factor_norms, :occupations,
             :dimension_ids, :completed_assessments

  has_many :pages, serializer: Reports::PageSerializer
  has_many :filters, serializer: Reports::FilterSerializer
  has_many :assessments, serializer: Reports::AssessmentSerializer

  def factors
    object_assessment_ids = object.assessment_ids
    factors = Factor.
      selecting {['factors.*',
                  array(
                    _(
                      FactorsScoring.
                        select(:question_id).
                        where.has { |fs| fs.factor_id.eq(id) & fs.assessment_id.eq(object_assessment_ids) }.
                        where('json_array_length(props) > 0')
                    )
                  ).as('question_ids')
      ]}.
      where(dimension_id: object.dimension_ids).
      order(name: :asc)
    aliases = FactorsAlias.where(factor_id: factors.ids, report_id: object.id).group_by(&:factor_id)
    factors.group_by(&:dimension_id).transform_values do |group|
      group.map do |obj|
        ::Factors::WithoutSubFactorsSerializer.new(obj, assessment_id: object_assessment_ids,
                                                        report_id: object.id,
                                                        alias: aliases[obj.id]&.first)
      end
    end
  end

  def occupations
    occupations = Occupation.includes(:occupations_factors).
                             where(dimension_id: object.assessments.pluck(:dimension_id)).
                             order(name: :asc)
    occupations.group_by(&:dimension_id).transform_values do |group|
      group.map { |occupation| OccupationSerializer.new(occupation) }
    end
  end

  def assigns
    return [] unless @instance_options[:membership]

    assigns = Assign.includes(:membership).joins(:membership).
      where(assessment_id: object.assessment_ids, memberships: { client_id: @instance_options[:membership].client_id })

    assigns.group_by(&:assessment_id).transform_values do |group|
      group.map { |assign| AssignShortSerializer.new(assign, membership: @instance_options[:membership]) }
    end
  end

  def factor_norms
    norms = Norm.includes(:factors_norms).where(dimension_id: object.assessments.pluck(:dimension_id)).distinct
    norms.each_with_object(Hash.new) do |norm, hash|
      hash[norm.id] = norm.factors_norms.group_by(&:type)
    end
  end

  def dimension_ids
    object.dimension_ids
  end

  def completed_assessments
    return object.assessment_ids unless @instance_options[:assigns]
    @instance_options[:assigns].select { |assign| assign.completed? }.map(&:assessment_id)
  end
end
