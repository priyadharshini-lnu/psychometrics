#
# Abstract Form

# use case:
# 1. Implement AbstractForm (for example: MyForm)
# 2. Use in the controller:
#
# data = MyForm.new(params, { param_1: 'my_param' })
# if data.valid?
#   do success login
# else
#   do error login
#
class AbstractForm

  include ActiveModel::Validations
  include ActiveModel::Conversion
  extend ActiveModel::Naming

  class << self
    # TODO if it is possible, rewrite without class variables
    def attr_accessor(*vars)
      @@attributes ||= []
      @@attributes.concat vars
      super(*vars)
    end
  end

  #
  # @param [ActionController::Parameters] attributes
  #
  def initialize(attributes = {}, extra_data)
    @extra_data = extra_data
    attributes  = form_params(attributes)
    attributes.each do |name, value|
      send("#{name}=", value) if respond_to? "#{name}="
    end
  end

  #
  # Convert strong params to hash
  #
  # @param [ActionController::Parameters] params
  #
  # @return [Hash]
  #
  def form_params(params)
    params.permit(@@attributes)
  end

  def attributes
    @@attributes
  end

end