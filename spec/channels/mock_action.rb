class MockAction
  include Assessments::Actions::Block
  def params
    { 'assessment_id' => Assessment.first.id }
  end

  def policy(model)
    Administration::AssessmentPolicy.new(User.first, model)
  end

  def transmit(data)
    data
  end

  def current_administrator
    User.first
  end
end
