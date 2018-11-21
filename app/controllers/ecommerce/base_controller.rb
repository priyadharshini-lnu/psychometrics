module Ecommerce
  class BaseController < ActionController::Base
    protect_from_forgery with: :exception
    add_flash_types :notice, :error, :success
    helper_method :current_currency

    layout 'ecommerce'

    # Authentication user/manager
    before_action :extract_shopping_cart

    def current_currency
      @current_currency ||= begin
        currency = cookies[:currency] && Settings.currencies.include?(cookies[:currency]) ? cookies[:currency] : Settings.default_currency
        Money::Currency.find(currency)
      end
    end

    private

    def extract_shopping_cart
      @cart = Ecommerce::Cart.new(session)
    end

    def authenticate_user!
      redirect_to(new_ecommerce_session_path) && return unless user_signed_in?
      super
    end
  end
end
