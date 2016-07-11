module Administration::Policies
  extend ActiveSupport::Concern

  def authorize(record, query = nil)
    record = [:administration, record]
    super
  end
end
