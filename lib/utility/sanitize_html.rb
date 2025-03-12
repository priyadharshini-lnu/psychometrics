# frozen_string_literal: true

module Utility
  class SanitizeHtml
    include ActionView::Helpers::SanitizeHelper

    # List of tags and attributes are copied from https://github.com/cure53/DOMPurify

    ALLOWED_TAGS = %w[
      a abbr acronym address area article aside audio b bdi bdo big blink blockquote body br button canvas caption
      center cite code col colgroup content data datalist dd decorator del details dfn dialog dir div dl dt element
      em fieldset figcaption figure font footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i img input ins kbd
      label legend li main map mark marquee menu menuitem meter nav nobr ol optgroup option output p picture pre
      progress q rp rt ruby s samp section select shadow small source spacer span strike strong style sub summary
      sup table tbody td template textarea tfoot th thead time tr track tt u ul var video wbr svg altglyph
      altglyphdef altglyphitem animatecolor animatemotion animatetransform circle clippath defs desc ellipse filter
      font g glyph glyphref hkern image line lineargradient marker mask metadata mpath path pattern polygon polyline
      radialgradient rect stop style switch symbol text textpath title tref tspan view vkernmath menclose merror
      mfenced mfrac mi mlabeledtr mmultiscripts mn mo mover mpadded mphantom mroot mrow ms mspace msqrt mstyle
      msub msup msubsup mtable mtd mtext mtr munder munderover feBlend feColorMatrix feComponentTransfer feComposite
      feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR
      feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight
      feTile feTurbulence
    ].freeze

    # Basic HTML/Accessibility Attributes
    BASIC_ATTRIBUTES = %w[
      autopictureinpicture cite default ismap kind label lang list media method
      nonce noshade nowrap open optimum pubdate radiogroup rel rev reversed
      role spellcheck selected shape sizes span srclang summary xmlns
      slot accent-height accumulate additive alignment-baseline ascent attributename
      attributetype azimuth basefrequency baseline-shift begin bias clip
      clippathunits clip-path clip-rule colorinterpolation
    ].freeze

    # SVG Core Attributes
    SVG_CORE_ATTRIBUTES = %w[
      color-interpolation color-interpolation-filters color-profile color-rendering
      cx cy d dx dy diffuseconstant direction display divisor dur edgemode
      elevation end fill fill-opacity fill-rule filter filterunits flood-color
      flood-opacity font-family font-size font-size-adjust font-stretch font-style
      font-variant font-weight fx fy g1 g2 glyph-name glyphref gradientunits
      gradienttransform image-rendering in in2
    ].freeze

    # SVG Transform and Effects
    SVG_TRANSFORM_ATTRIBUTES = %w[
      k k1 k2 k3 k4 kerning keypoints keysplines keytimes lengthadjust
      letter-spacing kernelmatrix kernelunitlength lighting-color local marker-end
      marker-mid marker-start markerheight markerunits markerwidth maskcontentunits
      maskunits mask mode numoctaves offset operator opacity order
      orient orientation origin overflow paint-order path pathlength
    ].freeze

    # SVG Pattern and Rendering
    SVG_PATTERN_ATTRIBUTES = %w[
      patterncontentunits patterntransform patternunits points preservealpha
      preserveaspectratio primitiveunits r rx ry radius refx refy repeatcount
      repeatdur restart result rotate scale seed shape-rendering specularconstant
      specularexponent spreadmethod startoffset stddeviation stitchtiles stop-color
      stop-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin
      stroke-miterlimit stroke-opacity stroke stroke-width surfacescale systemlanguage
    ].freeze

    # MathML and Additional SVG
    MATHML_SVG_ATTRIBUTES = %w[
      targetx targety transform transform-origin text-anchor text-decoration
      text-rendering textlength u1 u2 unicode values viewbox visibility version
      vert-adv-y vert-origin-x vert-origin-y word-spacing wrap writing-mode
      xchannelselector ychannelselector x x1 x2 y y1 y2 z zoomandpan accent
      accentunder bevelled close columnsalign columnlines columnspan denomalign depth
    ].freeze

    # MathML Specific
    MATHML_SPECIFIC_ATTRIBUTES = %w[
      displaystyle encoding fence frame largeop length linethickness lspace lquote
      mathbackground mathcolor mathsize mathvariant maxsize minsize movablelimits
      notation numalign open rowalign rowlines rowspacing rspace rquote scriptlevel
      scriptminsize scriptsizemultiplier selection separator separators stretchy
      subscriptshift supscriptshift symmetric voffset
    ].freeze

    # Form and input attributes
    FORM_ATTRIBUTES = %w[
      accept action autocomplete autocapitalize capture checked disabled download enctype for hidden high inputmode
      integrity low max maxlength min minlength multiple name novalidate pattern placeholder readonly required size
      step value
    ].freeze

    # Presentation attributes
    PRESENTATION_ATTRIBUTES = %w[
      align background bgcolor border cellpadding cellspacing class clear color cols colspan coords dir face headers
      height rows rowspan scope style valign width colorconnect tabindex
    ].freeze

    # Media attributes
    MEDIA_ATTRIBUTES = %w[
      alt autoplay controls controlslist crossorigin datetime decoding disablepictureinpicture
      disableremoteplayback draggable enterkeyhint href hreflang id loading loop muted playsinline poster preload
      src srcdoc srcset start target title translate usemap type
    ].freeze

    # Combined allowed attributes
    ALLOWED_ATTRIBUTES = (
      FORM_ATTRIBUTES +
        PRESENTATION_ATTRIBUTES +
        MEDIA_ATTRIBUTES +
        BASIC_ATTRIBUTES +
        SVG_CORE_ATTRIBUTES +
        SVG_TRANSFORM_ATTRIBUTES +
        SVG_PATTERN_ATTRIBUTES +
        MATHML_SVG_ATTRIBUTES +
        MATHML_SPECIFIC_ATTRIBUTES
    ).freeze

    def self.process(html)
      new.sanitize(html, tags: ALLOWED_TAGS.dup, attributes: ALLOWED_ATTRIBUTES.dup)
    end
  end
end
