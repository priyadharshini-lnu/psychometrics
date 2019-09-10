# frozen_string_literal: true

# == Schema Information
#
# Table name: factors_scoring
#
#  id            :integer          not null, primary key
#  props         :json
#  factor_id     :integer
#  assessment_id :integer
#  question_id   :integer
#

class FactorsScoringSerializer < ActiveModel::Serializer
  attributes :id, :props, :question_id
end
