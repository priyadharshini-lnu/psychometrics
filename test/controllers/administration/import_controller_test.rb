require 'test_helper'

class Administration::ImportControllerTest < ActionDispatch::IntegrationTest
  test 'should get new' do
    get administration_import_new_url
    assert_response :success
  end

  test 'should get create' do
    get administration_import_create_url
    assert_response :success
  end
end
