class Administration::BaseController < ActionController::Base
  layout 'administration'
  before_action :authenticate_administrator!
  protect_from_forgery with: :exception
end
