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

class FactorsScoring < ApplicationRecord
  self.table_name = :factors_scoring

  belongs_to :assessment
  belongs_to :factor
  belongs_to :question
end
