class BlockDecorator < BaseDecorator
  def assessments_name
    object.blocks.map(&:assessment).uniq.map(&:name).join(', ')
  end
end
