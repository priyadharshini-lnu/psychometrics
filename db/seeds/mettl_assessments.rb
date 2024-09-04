# CAMPAIGN_ID=10592 PUBLIC_KEY=your_public_key PRIVATE_KEY=your_private_key bundle exec rails db:seed:mettl_assessments

campaign_id = ENV.fetch('CAMPAIGN_ID', nil)
public_key = ENV.fetch('PUBLIC_KEY')
private_key = ENV.fetch('PRIVATE_KEY')

ApplicationRecord.transaction do
  campaign = Campaign.find(campaign_id)
  project = campaign.project
  created_by = User.superadmins.last
  
  encrypted_public_key = Base64.encode64(Encryptor.encrypt(public_key))
  encrypted_private_key = Base64.encode64(Encryptor.encrypt(private_key))

  Integration.find_or_create_by(
    project_id: project.id,
    name: 'mettl',
    active: true,
    config: { public_key: encrypted_public_key, private_key: encrypted_private_key }
  )

  mettl_assessment1 = MettlAssessment.find_or_create_by(project_id: project.id, product_id: 1241794, name: 'Mettl Personality Map')
  mettl_assessment1.update(
    duration: 45,
    registration_fields: [
      { "name" => "Email Address", "type" => "TextBox", "required" => true, "validate" => false },
      { "name" => "First Name", "type" => "TextBox", "required" => true, "validate" => false }
    ]
  )

  mettl_assessment2 = MettlAssessment.find_or_create_by(project_id: project.id, product_id: 1237160, name: 'Video Recording')
  mettl_assessment2.update(
    duration: 30,
    registration_fields: [
      { "name" => "Email Address", "type" => "TextBox", "required" => true, "validate" => false },
      { "name" => "First Name", "type" => "TextBox", "required" => true, "validate" => false },
      { "name" => "Last Name", "type" => "TextBox", "required" => false, "validate" => false },
      { "name" => "Gender Identity", "type" => "SelectBox", "required" => false, "validate" => false, "values" => ["Male", "Female", "Others", "Prefer not to answer"] },
      { "name" => "Country of Residence", "type" => "SelectBox", "required" => false, "validate" => false, "values" => [
        "Afghanistan", "Albania", "Cameroon", "Canada", "Central African Republic", "Chad", "Fiji", "Finland", "France", "Gabon", "Gambia", "India", "Indonesia", "Iran", "Tajikistan", "Tanzania"
      ]}
    ]
  )

  mettl_assessment3 = MettlAssessment.find_or_create_by(project_id: project.id, product_id: 1237107, name: 'Entry Level Aptitude Test')
  mettl_assessment3.update(
    duration: 60,
    registration_fields: [
      { "name" => "Email Address", "type" => "TextBox", "required" => true, "validate" => false },
      { "name" => "First Name", "type" => "TextBox", "required" => true, "validate" => false }
    ]
  )

  mettl_assessment4 = MettlAssessment.find_or_create_by(project_id: project.id, product_id: 1225766, name: 'Ruby on Rails')
  mettl_assessment4.update(
    duration: 10,
    registration_fields: [
      { "name" => "Email Address", "type" => "TextBox", "required" => true, "validate" => false },
      { "name" => "First Name", "type" => "TextBox", "required" => true, "validate" => false },
      { "name" => "Last Name", "type" => "TextBox", "required" => true, "validate" => true },
      { "name" => "Gender Identity", "type" => "SelectBox", "required" => false, "validate" => false, "values" => ["Male", "Female", "Others", "Prefer not to answer"] },
      { "name" => "Country of Residence", "type" => "SelectBox", "required" => false, "validate" => false, "values" => [
        "Afghanistan", "Albania", "Cameroon", "Canada", "Central African Republic", "Chad", "Fiji", "Finland", "France", "Gabon", "Gambia", "India", "Indonesia", "Iran", "Tajikistan", "Tanzania"
      ]}
    ]
  )

  assessment1 = Assessment.find_or_create_by!(
    category: 'mettl',
    name: 'Mettl Personality Map',
    type: Assessment::TYPES[:mettl],
    project_id: project.id,
    owner_id: project.client.id,
    dimension_id: Dimension.last.id,
    external_settings: { "assessment_id"=> mettl_assessment1.id },
    created_by_id: created_by.id
  )

  assessment2 = Assessment.find_or_create_by!(
    category: 'mettl',
    name: 'Video Recording',
    type: Assessment::TYPES[:mettl],
    project_id: project.id,
    owner_id: project.client.id,
    dimension_id: Dimension.last.id,
    external_settings: { "assessment_id"=> mettl_assessment2.id },
    created_by_id: created_by.id
  )

  assessment3 = Assessment.find_or_create_by!(
    category: 'mettl',
    name: 'Entry Level Aptitude Test',
    type: Assessment::TYPES[:mettl],
    project_id: project.id,
    owner_id: project.client.id,
    dimension_id: Dimension.last.id,
    external_settings: { "assessment_id"=> mettl_assessment3.id },
    created_by_id: created_by.id
  )

  assessment4 = Assessment.find_or_create_by!(
    category: 'mettl',
    name: 'Ruby on Rails',
    type: Assessment::TYPES[:mettl],
    project_id: project.id,
    owner_id: project.client.id,
    dimension_id: Dimension.last.id,
    external_settings: { "assessment_id"=> mettl_assessment4.id },
    created_by_id: created_by.id
  )
end
