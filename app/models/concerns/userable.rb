module Userable
  extend ActiveSupport::Concern
  # Some hack
  # Cause when use attr_accessor
  #   And then try select same attributes from database
  #   We get nil attributes
  included do
    attr_accessor :email, :first_name, :last_name

    def email
      @email || self[:email]
    end

    def first_name
      @first_name || self[:first_name]
    end

    def last_name
      @last_name || self[:last_name]
    end
  end
end
