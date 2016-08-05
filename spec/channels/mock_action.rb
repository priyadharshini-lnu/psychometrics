class MockAction
  include Actions::Block
  def params
    { 'assessment_id' => 1 }
  end

  def policy(model)
    Administration::AssessmentPolicy.new(User.find_by_email('superadmin@example.com'), model)
  end

  def transmit(data)
    data
  end

  def current_administrator
    User.find_by_email('superadmin@example.com')
  end
end