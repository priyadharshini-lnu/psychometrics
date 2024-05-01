class AddEmailToIihtUserAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :iiht_user_assessments, :email, :string

    reversible do |dir|
      dir.up do
        sql = <<-SQL
          UPDATE iiht_user_assessments
          SET email = iau.email
          FROM (
            SELECT iiht_user_assessments.id, users.email as email
            FROM iiht_user_assessments
            JOIN user_assessments ON user_assessments.id = iiht_user_assessments.user_assessment_id
            JOIN users ON users.id = user_assessments.subject_id
          ) AS iau
          WHERE iiht_user_assessments.id = iau.id
        SQL

        execute(sql)
      end
    end
  end
end
