class AddTypeToAssessments < ActiveRecord::Migration[5.0]
  def up
    add_column :assessments, :type, :string
    add_column :assessments, :mindmill_id, :integer
    Assessment.update_all('type=\'Assessments::Common\'')
    Translation.where(resource_type: 'Assessment').update_all('resource_type=\'Assessments::Common\'')
  end

  def down
    remove_column :assessments, :type
    remove_column :assessments, :mindmill_id
    Translation.where(resource_type: 'Assessments::Common').update_all('resource_type=\'Assessment\'')
  end
end
