class Administration::PdfRenderer
  def initialize(resource, context)
    @context = context
    @resource = resource
  end

  def render opts = {}
    tmp_folder = Rails.root.join('tmp/reports')
    output = "tmp/reports/#{@resource.id}_#{Time.now.to_f}.pdf"
    
    args = {
      url: @context.url_for({ action: :preview, id: @resource }),
      output: output,
      pageWidth: 850,
      pageHeight: 1100
    }.merge(opts).to_a.map{|i| i.join('=')}.join(' ')

    Dir.mkdir(tmp_folder) unless Dir.exist?(tmp_folder)

    system("phantomjs #{Rails.root.join('lib/raster.js')} #{args}")

    output
  end
end
