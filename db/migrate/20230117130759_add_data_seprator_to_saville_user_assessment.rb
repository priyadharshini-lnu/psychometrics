# frozen_string_literal: true

class AddDataSepratorToSavilleUserAssessment < ActiveRecord::Migration[6.1]
  def change
    add_column :saville_user_assessments, :data_seprator, :string

    ActiveRecord::Migration[6.1].execute(%(
      UPDATE saville_user_assessments SET data_seprator = campaigns.uniq_code FROM saville_user_assessments sua
      INNER JOIN user_assessments ON sua.user_assessment_id = user_assessments.id
      INNER  JOIN campaigns ON user_assessments.campaign_id = campaigns.id
      WHERE saville_user_assessments.id = sua.id
    ))
  end
end
