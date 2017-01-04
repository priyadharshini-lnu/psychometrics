# == Schema Information
#
# Table name: blocks
#
#  id            :integer          not null, primary key
#  name          :string
#  position      :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  assessment_id :integer
#  deleted_at    :datetime
#  props         :json
#  view          :integer          default("assessments")
#  disabled      :boolean          default(FALSE)
#  template_id   :integer
#

class BlockSerializer < ActiveModel::Serializer
  attributes :id, :name, :position, :deleted, :props, :created_at, :template_id, :questions

  #
  def questions
    object.questions_ams.map do |q|
      QuestionSerializer.new(q)
    end
  end

  def deleted
    !!object.deleted_at
  end

  def created_at
    I18n.l object.created_at, format: :short
  end
end
